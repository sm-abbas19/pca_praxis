


# 🛡️ PCA-Praxis: Secure CLI Agent

**PCA-Praxis** is a secure, on-premise Natural Language to Shell (NL2SH) agent designed to bridge the gap between human intent and the command line. Unlike standard AI coding assistants, PCA-Praxis prioritizes **system security** via a "Defense-in-Depth" architecture.

It translates natural language requests (e.g., *"Find all text files created yesterday"*) into executable Bash commands using a local LLM, validates them against strict security policies, and executes them within an ephemeral **Docker Sandbox**.

---

## 🚀 Key Features

* **🔒 Blast Containment:** Execution occurs inside isolated, Ubuntu Linux containers. The container is destroyed immediately after the command finishes, preventing persistent threats.
* **🧠 Local Intelligence:** Powered entirely by **Ollama (Phi-3)** running on-premise. No data leaves the local machine, ensuring privacy.
* **🛡️ Defense-in-Depth:**
    * **Input Guardrails:** Sanitizes user input to prevent prompt injection attacks.
    * **Policy Enforcement:** A "Default-Deny" allowlist blocks dangerous tools (like `rm`, `wget`, `chmod`) by default.
* **👁️ Human-in-the-Loop:** No command is executed without explicit user authorization.
* **📂 Dynamic Binding:** Automatically mounts user-selected directories into the sandbox, balancing isolation with productivity.
* **📝 Context Awareness:** Maintains short-term memory of the conversation, allowing references to previous files (e.g., *"Delete **that** file"*).

## 🛠️ Technology Stack

* **Interface:** Streamlit (Python)
* **Orchestration:** Python 3.10+
* **LLM Backend:** Ollama (Phi-3 Mini)
* **Sandboxing:** Docker Engine + Docker SDK for Python
* **Native GUI:** Tkinter (for secure directory selection)

## ⚙️ System Architecture

The system follows a strict sequential pipeline to ensure safety:

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
````

### 2\. Set up the Environment

It is recommended to use a virtual environment.

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install streamlit docker requests
```

### 3\. Initialize the AI Model

Pull the Phi-3 model using Ollama.

```bash
ollama pull phi3
```

### 4\. Configure Docker Permissions (Linux Only)

Ensure your user allows Python to access the Docker Daemon without root.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## ▶️ Usage

1.  **Start the application:**

    ```bash
    streamlit run app.py
    ```

2.  **Access the UI:**
    Open the URL provided in the terminal (usually `http://localhost:8501`).

3.  **Select a Target Folder:**
    Use the sidebar to choose which directory the agent can access.

4.  **Enter a Task:**
    Type your request (e.g., *"List all Python files"*).

5.  **Execute:**
    Review the proposed command and click **Execute Now**.

## ⚠️ Security Notice

> **Warning:** While PCA-Praxis employs sandboxing and allowlists, always review commands before execution. The "Force Execute" feature grants the agent permission to bypass safety checks. Use with caution.

## 👥 Contributors

Submitted as a Semester Project by smabbas and Hira Sardar for **Theory of Automata & Formal Languages**.


