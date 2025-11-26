# Quick Start Guide - How to Run the Project

## 🎯 Overview

**Docker Desktop** = Background service (must be running, but you don't run commands in it)
**Your Terminal** = Where you run the project commands (Cursor terminal, CMD, PowerShell, etc.)

---

## 📋 Prerequisites Checklist

Before starting, ensure:

1. ✅ **Docker Desktop is installed and running**
   - Check: Look for Docker whale icon in system tray (bottom-right)
   - If not running: Open Docker Desktop from Start menu
   - Verify: Open terminal and run `docker ps` (should not error)

2. ✅ **Ollama is installed and running**
   - Verify: Run `ollama --version` in terminal
   - If not installed: Download from https://ollama.ai/download
   - Start: Ollama usually runs automatically, but you can run `ollama serve` if needed

3. ✅ **Required Docker image is pulled**
   ```bash
   docker pull ubuntu:latest
   ```

4. ✅ **Required Ollama model is pulled**
   ```bash
   ollama pull phi3
   ```

---

## 🚀 Step-by-Step: Running the Project

### Step 1: Open Terminal in Cursor

- In Cursor, press `` Ctrl + ` `` (backtick) to open terminal
- Or go to: **Terminal → New Terminal**
- Make sure you're in the project root: `C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main`

### Step 2: Set Up Backend (First Terminal)

**2.1. Navigate to backend folder:**
```bash
cd backend
```

**2.2. Create virtual environment (if not already created):**
```bash
python -m venv venv
```

**2.3. Activate virtual environment:**
```bash
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# On Windows CMD:
venv\Scripts\activate.bat

# On Linux/Mac:
source venv/bin/activate
```

**2.4. Install backend dependencies:**
```bash
pip install -r requirements.txt
```

**2.5. Start the backend server:**
```bash
python app.py
```

**✅ You should see:**
```
 * Running on http://127.0.0.1:5000
```

**⚠️ Keep this terminal open!** The backend must keep running.

---

### Step 3: Set Up Frontend (Second Terminal)

**3.1. Open a NEW terminal in Cursor:**
- Press `` Ctrl + Shift + ` `` for a new terminal
- Or: **Terminal → New Terminal**

**3.2. Navigate to frontend folder:**
```bash
cd frontend
```

**3.3. Install frontend dependencies (first time only):**
```bash
npm install
```

**3.4. Start the frontend:**
```bash
npm start
```

**✅ You should see:**
- Browser automatically opens at `http://localhost:3000`
- Or you'll see: "Compiled successfully!"

**⚠️ Keep this terminal open too!** The frontend must keep running.

---

## 🎉 Using the Application

1. **Open your browser** (if it didn't open automatically)
   - Go to: `http://localhost:3000`

2. **Use the application:**
   - Enter a task in the input field (e.g., "List all Python files")
   - Click "Generate Plan"
   - Review the command
   - Click "Execute Now"

---

## 🛑 Stopping the Project

1. **Stop Frontend:** In the frontend terminal, press `Ctrl + C`
2. **Stop Backend:** In the backend terminal, press `Ctrl + C`

---

## 📝 Summary: What Runs Where

| Component | Where It Runs | How to Start |
|-----------|--------------|--------------|
| **Docker Desktop** | Background service | Open from Start menu (must be running) |
| **Ollama** | Background service | Usually auto-starts, or run `ollama serve` |
| **Backend (Flask)** | Cursor terminal | `cd backend` → `python app.py` |
| **Frontend (React)** | Cursor terminal | `cd frontend` → `npm start` |

---

## 🔍 Troubleshooting

### Backend won't start:
- Check if port 5000 is in use
- Verify virtual environment is activated
- Check if all dependencies are installed: `pip list`

### Frontend won't start:
- Check if port 3000 is in use
- Verify Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### "Docker connection error":
- Ensure Docker Desktop is running (check system tray)
- Try: `docker ps` to verify Docker is accessible

### "Ollama connection error":
- Ensure Ollama is running
- Check: `curl http://localhost:11434/api/tags`
- Start Ollama: `ollama serve`

---

## 💡 Quick Reference Commands

```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend  
cd frontend
npm install  # First time only
npm start
```

---

## ✅ Final Checklist

Before running, verify:
- [ ] Docker Desktop is running (whale icon in system tray)
- [ ] Ollama is installed and accessible (`ollama --version`)
- [ ] Python is installed (`python --version`)
- [ ] Node.js is installed (`node --version`)
- [ ] You're in the project root directory
- [ ] Two terminals are ready (one for backend, one for frontend)

