🛡️ PCA-Praxis: Secure CLI Agent
PCA-Praxis is a local AI agent designed to bridge the gap between Natural Language and the Command Line Interface (CLI). Unlike standard AI coding assistants, PCA-Praxis prioritizes system security via a "Defense-in-Depth" architecture.

It translates user intent (e.g., "Find all text files created yesterday") into safe Bash commands using a local LLM, verifies them against a strict policy, and executes them inside an isolated Docker Sandbox.

🚀 Key Features
🔒 Blast Containment: All commands run inside ephemeral Alpine Linux Docker containers. The container is destroyed immediately after execution, preventing persistent threats.

🧠 Local Intelligence: Powered by Ollama (Phi-3) running entirely on-premise. No data leaves your machine.

🛡️ Defense-in-Depth:

Input Guardrails: Sanitizes input to prevent prompt injection.

Policy Enforcement: A "Default-Deny" allowlist blocks dangerous tools (like rm, wget, chmod) by default.

Force Execute: "Risky" commands require explicit user override via a specialized UI flow.

👁️ Human-in-the-Loop: No command runs without user verification.

📂 Smart Binding: Dynamically mounts user-selected folders into the sandbox, balancing isolation with productivity.

🧠 Context Awareness: Remembers previous commands and file references (e.g., "Delete that file").

🛠️ Tech Stack
Frontend: Streamlit (Python)

Backend Logic: Python 3.11

LLM Engine: Ollama (Phi-3 Mini)

Sandboxing: Docker Engine + Docker SDK for Python

GUI Tools: Tkinter (for native folder selection)

⚙️ Architecture
The system follows a strict sequential flow to ensure safety:

User Input: Natural language request via Streamlit UI.

Sanitization: Regex filters remove chaining characters (&, ;, |).

Translation: Local LLM converts request to Bash.

Policy Check: The command is validated against a strict ALLOWLIST.

Verification: User reviews the plan. Risky commands trigger a warning.

Execution: Docker mounts the target directory, runs the command, captures output, and destroys the container.

📦 Installation
Prerequisites
Linux (Recommended) or Windows with WSL2

Docker Engine installed and running

Ollama installed (curl -fsSL https://ollama.com/install.sh | sh)

Setup
Clone the repository

Bash

git clone https://github.com/yourusername/pca-praxis.git
cd pca-praxis
Pull the LLM Model

Bash

ollama pull phi3
Set up the Python Environment

Bash

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
(Note: requirements.txt should include: streamlit, docker, requests)

Run the Agent

Bash

streamlit run app.py
⚠️ Security Notice
While this tool uses sandboxing and allowlists, always review commands before execution. The "Force Execute" feature grants the agent permission to modify your files. Use with caution.

Built by [Member A Name] & [Member B Name] for the Theory of Automata & Formal Languages Project.
