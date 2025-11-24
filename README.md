# 🛡️ PCA-Praxis: Secure CLI Agent

**PCA-Praxis** is a secure, on-premise Natural Language to Shell (NL2SH) agent designed to bridge the gap between human intent and the command line. Unlike standard AI coding assistants, PCA-Praxis prioritizes **system security** via a "Defense-in-Depth" architecture.

It translates natural language requests (e.g., *"Find all text files created yesterday"*) into executable Bash commands using a local LLM, validates them against strict security policies, and executes them within an ephemeral **Docker Sandbox**.

---

## 🚀 Key Features

* **🔒 Blast Containment:** Execution occurs inside isolated, ephemeral Alpine Linux containers. [cite_start]The container is destroyed immediately after the command finishes, preventing persistent threats[cite: 73, 146].
* **🧠 Local Intelligence:** Powered entirely by **Ollama (Phi-3)** running on-premise. [cite_start]No data leaves the local machine, ensuring privacy[cite: 100].
* **🛡️ Defense-in-Depth:**
    * [cite_start]**Input Guardrails:** Sanitizes user input to prevent prompt injection attacks[cite: 113].
    * [cite_start]**Policy Enforcement:** A "Default-Deny" allowlist blocks dangerous tools (like `rm`, `wget`, `chmod`) by default[cite: 72].
* [cite_start]**👁️ Human-in-the-Loop:** No command is executed without explicit user authorization[cite: 140].
* **📂 Dynamic Binding:** Automatically mounts user-selected directories into the sandbox, balancing isolation with productivity.
* **📝 Context Awareness:** Maintains short-term memory of the conversation, allowing references to previous files (e.g., *"Delete **that** file"*).

## 🛠️ Technology Stack

* **Interface:** Streamlit (Python)
* **Orchestration:** Python 3.10+
* **LLM Backend:** Ollama (Phi-3 Mini)
* **Sandboxing:** Docker Engine + Docker SDK for Python
* **Native GUI:** Tkinter (for secure directory selection)

## ⚙️ System Architecture

[cite_start]The system follows a strict sequential pipeline to ensure safety[cite: 91]:

1.  **User Input:** Natural language request via Streamlit UI.
2.  **Sanitization:** Regex filters remove chaining characters (`&`, `;`, `|`).
3.  **Translation:** Local LLM converts request to Bash.
4.  **Policy Check:** The command is validated against a strict `ALLOWLIST`.
5.  **Verification:** User reviews the plan. Risky commands trigger a warning (Force Execute).
6.  **Execution:** Docker mounts the target directory, runs the command, captures output, and destroys the container.

## 📦 Installation & Setup

### Prerequisites
* **OS:** Linux (Recommended) or Windows with WSL2.
* **Docker Engine:** Must be installed and running.
* **Ollama:** Must be installed and running.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/pca-praxis.git](https://github.com/yourusername/pca-praxis.git)
cd pca-praxis
