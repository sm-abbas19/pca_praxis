# 🛡️ PCA-Praxis: Secure CLI Agent

PCA-Praxis is a secure, on-premise **Natural Language to Shell (NL2SH)** agent designed to bridge the gap between human intent and the command line — *without sacrificing system safety*.  
Unlike typical AI assistants, PCA-Praxis is built around a strict **Defense-in-Depth** security model.

It translates natural language instructions (e.g., *“Find all text files created yesterday”*) into Bash commands using a **local LLM**, validates them using hardened security policies, and executes them in an **ephemeral Docker sandbox**.

---

## 🚀 Key Features

### 🔒 Blast Containment  
Commands run inside isolated, throwaway **Alpine Linux containers**.  
Each container is destroyed immediately after execution, eliminating persistence risk.

### 🧠 Local Intelligence  
Powered fully by **Ollama (Phi-3 Mini)** running on-premise.  
**No data leaves your machine.**

### 🛡️ Defense-in-Depth  
- **Input Guardrails:** Sanitizes input to block prompt injection (`;`, `&&`, `|`, etc.).  
- **Policy Enforcement:** Strict **default-deny allowlist** blocks dangerous tools (`rm`, `wget`, `chmod`, etc.).

### 👁️ Human-in-the-Loop  
No command executes without explicit user approval.

### 📂 Dynamic Binding  
Automatically mounts user-selected directories into the sandbox—secure yet productive.

### 📝 Context Awareness  
Short-term conversation memory enables contextual follow-ups.  
Example: “Delete that file” after referencing a previous result.

### 🛠️ Technology Stack  
- **Frontend:** React  
- **Backend:** Python (Flask)  
- **LLM:** Ollama (Phi-3 Mini)  
- **Sandboxing:** Docker Engine + Docker SDK (Python)

---

## ⚙️ System Architecture

The pipeline follows a strict, sequential safety flow:

1. **User Input:** Natural language via React UI  
2. **Sanitization:** Regex filters remove malicious operators  
3. **Translation:** Local LLM → Bash command  
4. **Policy Check:** Validate against allowlist  
5. **Verification:** User reviews generated command  
6. **Execution:**  
   - Sandbox spawns an isolated Docker container  
   - Mounts only approved directories  
   - Runs command  
   - Captures output  
   - Destroys container

---

## 📦 Installation & Setup

### **Prerequisites**
- **Linux (recommended)** or Windows with WSL2  
- **Docker Engine** (running)  
- **Ollama** (running)  
- **Node.js & npm**

---

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/pca-praxis.git
cd pca-praxis
```

2. Backend Setup

It’s recommended to use a virtual environment.
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask flask-cors docker requests

```
3. Frontend Setup
```bash
cd ../frontend
npm install
```

4. Initialize the AI Model

Pull the Phi-3 model with Ollama:

```bash
ollama pull phi3
```

5. Configure Docker Permissions (Linux Only)

Allow non-root Docker access:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

▶️ Usage

Start the Backend
```bash
# In one terminal
cd backend
source venv/bin/activate
python app.py
```

Start the Frontend
```bash
# In another terminal
cd frontend
npm start
```

Submitted By smabbas and hirasardar to Dr. Sohail Iqbal




