import re

def sanitize_input(user_text):
    """
    Removes dangerous characters to prevent prompt injection.
    """
    # Removes ; | & ` $ to prevent chaining commands
    return re.sub(r'[;`$|&]', '', user_text)

def validate_command(command):
    """
    Implements the 'Default-Deny' Allowlist policy.
    """
    # The strict list of tools we allow the agent to use
    ALLOWLIST = [
    "ls", "grep", "cat", "echo", "pwd", "whoami", "find",
    "head", "tail", "wc", "sort", "uniq", "touch", "mkdir",
    "cp", "diff", "du", "df", "date"  ]
    # Get the first word (the tool name)
    if not command:
        return False, "Empty command"

    tool = command.strip().split(" ")[0]

    if tool in ALLOWLIST:
        return True, "Allowed"
    else:
        return False, f"Security Alert: The tool '{tool}' is NOT in the allowlist."
