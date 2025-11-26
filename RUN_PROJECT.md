# Commands to Run PCA-Praxis Project

## 🚀 Quick Start Commands

### **Terminal 1: Start Backend (Flask API)**

```powershell
# Navigate to project root
cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main

# Navigate to backend folder
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the backend server
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
```

**⚠️ Keep this terminal open!**

---

### **Terminal 2: Start Frontend (React App)**

```powershell
# Navigate to project root
cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main

# Navigate to frontend folder
cd frontend

# Start the frontend (dependencies already installed)
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view pca-praxis-frontend in the browser.
  Local:            http://localhost:3000
```

**⚠️ Keep this terminal open!**

---

## 📋 Alternative: Using Batch Files

If you prefer, you can use the provided batch files:

**For Backend:**
```powershell
cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main
.\start_backend.bat
```

**For Frontend:**
```powershell
cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main
.\start_frontend.bat
```

---

## ✅ Verification Checklist

Before running, ensure:
- [ ] Docker Desktop is running (check system tray)
- [ ] Ollama is installed and accessible (`ollama --version`)
- [ ] Python virtual environment exists in `backend/venv/`
- [ ] Node.js is installed (`node --version`)

---

## 🛑 Stopping the Project

- **Stop Frontend:** Press `Ctrl + C` in Terminal 2
- **Stop Backend:** Press `Ctrl + C` in Terminal 1

---

## 🌐 Access the Application

Once both servers are running:
- **Frontend:** Open browser to `http://localhost:3000`
- **Backend API:** Available at `http://localhost:5000`

