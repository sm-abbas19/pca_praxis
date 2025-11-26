# llm_engine.py
import requests
import json
import re

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
    system_prompt = """You are a Linux Bash expert.
    Translate the user's natural language request into a SINGLE executable Bash command.

    Rules:
    1. Output ONLY the command.
    2. Do NOT provide explanations.
    3. Use the [PREVIOUS CONTEXT] to resolve references.
    """

    full_prompt = f"{system_prompt}\n\n[PREVIOUS CONTEXT]:\n{context}\n\n[NEW REQUEST]:\n{user_input}"

    url = "http://localhost:11434/api/generate"
    data = {
        "model": "phi3",
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "num_ctx": 4096
        }
    }

    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            raw_text = response.json()['response']
            # CLEAN THE TEXT BEFORE RETURNING IT
            return _clean_response(raw_text)
        return "echo 'Error: LLM Generation Failed'"
    except Exception as e:
        return f"echo 'Connection Error: {str(e)}'"
