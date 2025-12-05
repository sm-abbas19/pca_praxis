# llm_engine.py
import os
import requests
import json
import re

_TASK_VERBS = {
    "make", "create", "generate", "list", "show", "display", "print", "write",
    "move", "copy", "delete", "remove", "rename", "download", "upload",
    "compress", "decompress", "extract", "archive", "find", "search", "grep",
    "scan", "count", "append", "add", "start", "stop", "restart", "launch",
    "tail", "head", "watch", "monitor", "kill", "terminate", "cleanup",
    "sort", "filter", "replace", "update", "install", "uninstall", "touch",
    "mkdir", "rmdir", "ls", "pwd", "cat", "rm", "mv", "cp", "chmod", "chown",
    "ps", "top", "service", "systemctl", "docker", "kubectl", "git", "pip", "npm",
    "enumerate", "sync", "backup", "purge", "clean", "inspect",
}

_TASK_OBJECTS = {
    "file", "files", "text", "log", "logs", "directory", "directories",
    "folder", "folders", "path", "paths", "service", "services", "server",
    "servers", "process", "processes", "container", "containers", "image",
    "images", "script", "scripts", "archive", "archives", "package", "packages",
    "repo", "repository", "repositories", "environment", "environments",
    "variable", "variables", "dependency", "dependencies", "permission",
    "permissions", "user", "users", "group", "groups", "socket", "sockets",
    "port", "ports", "config", "configs", "configuration", "configurations",
    "task", "tasks", "job", "jobs", "entry", "entries", "record", "records",
    "history", "histories", "backup", "backups", "csv", "json", "yaml", "yml",
    "xml", "html", "htm", "md", "txt", "log", "conf", "ini", "env", "sh",
    "bash", "py", "js", "ts", "java", "c", "cpp", "sql", "db", "tar", "gz",
    "tgz", "zip", "rar", "7z", "pdf", "doc", "docx", "ppt", "pptx", "xls",
    "xlsx", "png", "jpg", "jpeg", "gif",
}


def _int_from_env(name, default):
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _float_from_env(name, default):
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


_CPU_COUNT = os.cpu_count() or 1
_NUM_THREADS = max(1, _int_from_env("LLM_NUM_THREADS", _CPU_COUNT))
_NUM_CTX = max(512, _int_from_env("LLM_NUM_CTX", 3072))
_REQUEST_TIMEOUT = max(5.0, _float_from_env("LLM_REQUEST_TIMEOUT", 60.0))
_KEEP_ALIVE = _int_from_env("LLM_KEEP_ALIVE", 300)


def _looks_like_shell_request(text):
    """Return True when the natural language request maps to a shell action."""
    lowered = text.lower().strip()
    if not lowered:
        return False

    words = set(re.findall(r"[a-z]+", lowered))
    tokens = lowered.split()

    # Accept direct shell commands (e.g., "ls", "rm file") where the first token is a known command
    # and the remainder looks like flags/paths/resources rather than plain prose.
    if tokens and tokens[0] in _TASK_VERBS:
        if len(tokens) == 1:
            return True

        remaining = tokens[1:]
        if any(
            t in _TASK_OBJECTS
            or t.startswith("-")
            or re.search(r"[./\\]", t)
            or re.search(r"\d", t)
        for t in remaining):
            return True

    # If the prompt consists solely of known command words, accept it.
    if words and words <= _TASK_VERBS:
        return True

    if (words & _TASK_VERBS) and (words & _TASK_OBJECTS):
        return True

    return False

def _clean_response(text):
    """
    Internal helper to strip Markdown formatting (```bash ... ```)
    that small models often output despite instructions.
    """
    # 1. Remove ```bash, ```sh, or just ```
    clean = re.sub(r"```[a-z]*", "", text)
    # 2. Remove trailing ```
    clean = clean.replace("```", "")
    # 3. Remove leading/trailing whitespace
    return clean.strip()

def get_bash_command(user_input, context=""):
    """
    Sends prompt + conversation context to local Ollama instance.
    """
    if not _looks_like_shell_request(user_input):
        return "echo 'Unsupported request: expecting a bash task'"

    system_prompt = """You are a Linux Bash expert.
Translate the user's natural language request into a SINGLE executable Bash command.

Mandatory rules:
1. Output ONLY the command.
2. Do NOT provide explanations or extra text.
3. Use the [PREVIOUS CONTEXT] to resolve references.
4. If any part of the request is not a Bash/shell task, ignore that portion.
5. If no Bash task remains, respond exactly with:
   echo 'Unsupported request: expecting a bash task'
6. Never invent commands for non-shell topics.

Examples:
Request: "List names of US presidents. List all files in folder"
Response: echo 'Unsupported request: expecting a bash task'

Request: "List names of US presidents."
Response: echo 'Unsupported request: expecting a bash task'

Request: "Create three text files named a.txt b.txt c.txt"
Response: touch a.txt b.txt c.txt
"""

    full_prompt = f"{system_prompt}\n\n[PREVIOUS CONTEXT]:\n{context}\n\n[NEW REQUEST]:\n{user_input}"

    url = "http://localhost:11434/api/generate"
    data = {
        "model": "phi3",
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "num_ctx": _NUM_CTX,
            "num_thread": _NUM_THREADS
        },
        "keep_alive": _KEEP_ALIVE

    }

    try:
        response = requests.post(url, json=data, timeout=_REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        raw_text = payload.get('response', '')
        cleaned = _clean_response(raw_text)
        return cleaned or "echo 'Unsupported request: expecting a bash task'"
    except requests.RequestException as e:
        return f"echo 'Connection Error: {str(e)}'"
    except (ValueError, KeyError):
        return "echo 'Error: LLM Generation Failed'"
