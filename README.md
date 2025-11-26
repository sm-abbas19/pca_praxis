


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

* **Frontend:** React (JavaScript)
* **Backend:** Flask (Python REST API)
* **Orchestration:** Python 3.10+
* **LLM Backend:** Ollama (Phi-3 Mini)
* **Sandboxing:** Docker Engine + Docker SDK for Python
* **Legacy Interface:** Streamlit (Python) - see `app.py` in root directory

## ⚙️ System Architecture

The system follows a strict sequential pipeline to ensure safety:

1.  **User Input:** Natural language request via React frontend.
2.  **API Request:** Frontend sends request to Flask backend API.
3.  **Sanitization:** Regex filters remove chaining characters (`&`, `;`, `|`).
4.  **Translation:** Local LLM converts request to Bash.
5.  **Policy Check:** The command is validated against a strict `ALLOWLIST`.
6.  **Verification:** User reviews the plan. Risky commands trigger a warning (Force Execute).
7.  **Execution:** Docker mounts the target directory, runs the command, captures output, and destroys the container.

### Project Structure

```
pca_praxis-main/
├── backend/
│   ├── app.py              # Flask REST API server
│   └── requirements.txt    # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styles
│   │   └── index.js        # React entry point
│   ├── public/
│   └── package.json        # Frontend dependencies
├── llm_engine.py           # LLM integration (unchanged)
├── sandbox.py              # Docker execution (unchanged)
├── security.py             # Security validation (unchanged)
└── app.py                  # Legacy Streamlit version
```

## 📦 Installation & Setup

### Prerequisites

**⚠️ IMPORTANT: Both Docker and Ollama are REQUIRED for this project to function.**

* **OS:** Linux (Recommended) or Windows with WSL2.
* **Docker Engine:** Must be installed and running.
* **Ollama:** Must be installed and running with the `phi3` model.

#### Verify Prerequisites

Before proceeding, verify that both services are installed and running:

**Check Docker:**
```bash
docker --version
docker ps  # Should not error
```

**Check Ollama:**
```bash
ollama --version
ollama list  # Should show available models
```

**Install Docker (if needed):**
- Linux: `sudo apt-get install docker.io` or follow [Docker installation guide](https://docs.docker.com/get-docker/)
- Windows: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Install Ollama (if needed):**
- Visit [ollama.ai](https://ollama.ai) and download for your OS
- Or use: `curl -fsSL https://ollama.ai/install.sh | sh` (Linux/Mac)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/pca-praxis.git](https://github.com/yourusername/pca-praxis.git)
cd pca-praxis
````

### 2\. Set up the Backend Environment

It is recommended to use a virtual environment.

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Navigate to backend directory
cd backend

# Install backend dependencies
pip install -r requirements.txt
```

### 3\. Set up the Frontend Environment

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install
```

### 4\. Initialize the AI Model

**⚠️ REQUIRED:** Pull the Phi-3 model using Ollama. This is essential for the LLM to work.

```bash
ollama pull phi3
```

Verify the model is available:
```bash
ollama list  # Should show 'phi3' in the list
```

### 5\. Pull Docker Image

**⚠️ REQUIRED:** Ensure the Ubuntu Docker image is available (used for sandbox execution).

```bash
docker pull ubuntu:latest
```

### 7\. Configure Docker Permissions (Linux Only)

Ensure your user allows Python to access the Docker Daemon without root.

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify Docker access:
```bash
docker ps  # Should work without sudo
```

## ▶️ Usage

### Running the New Architecture (React + Flask)

1.  **Start the Backend API:**

    ```bash
    # From the backend directory
    cd backend
    python app.py
    ```
    
    The API will run on `http://localhost:5000`

2.  **Start the Frontend:**

    ```bash
    # From the frontend directory (in a new terminal)
    cd frontend
    npm start
    ```
    
    The frontend will open automatically at `http://localhost:3000`

3.  **Use the Application:**
    - Select a Target Folder using the sidebar
    - Enter a Task (e.g., *"List all Python files"*)
    - Review the proposed command and click **Execute Now**

### Running the Legacy Streamlit Version

If you prefer the original Streamlit interface:

```bash
# From the root directory
streamlit run app.py
```

Access the UI at `http://localhost:8501`

## ⚠️ Security Notice

> **Warning:** While PCA-Praxis employs sandboxing and allowlists, always review commands before execution. The "Force Execute" feature grants the agent permission to bypass safety checks. Use with caution.

## 👥 Contributors

Submitted as a Semester Project by smabbas and Hira Sardar for **Theory of Automata & Formal Languages**.


