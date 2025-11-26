# Windows Setup Guide

This guide helps you set up Docker and Ollama on Windows.

## 🔧 Issue 1: Docker Desktop Won't Start

### Common Solutions:

#### 1. **Start Docker Desktop Manually**
- Open Docker Desktop from the Start menu
- Wait for it to fully start (whale icon in system tray should be steady)
- Check if it shows "Docker Desktop is running" in the system tray

#### 2. **Restart Docker Desktop Service**
```powershell
# Run PowerShell as Administrator
Restart-Service -Name "com.docker.service"
```

Or manually:
- Press `Win + R`, type `services.msc`
- Find "Docker Desktop Service"
- Right-click → Restart

#### 3. **Check WSL2 (Required for Docker Desktop)**
Docker Desktop on Windows requires WSL2. Verify it's installed:

```powershell
wsl --version
```

If not installed or outdated:
```powershell
# Install WSL2
wsl --install
# Restart your computer after installation
```

#### 4. **Enable Virtualization**
- Ensure virtualization is enabled in BIOS/UEFI
- Check in Task Manager → Performance → CPU → "Virtualization: Enabled"

#### 5. **Reinstall Docker Desktop**
If nothing works:
1. Uninstall Docker Desktop
2. Download latest from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
3. Install and restart computer
4. Launch Docker Desktop and wait for it to start

### Verify Docker is Working:
```powershell
docker --version
docker ps
```

---

## 🔧 Issue 2: Ollama Not Installed

### Install Ollama on Windows:

#### Option 1: Download Installer (Recommended)
1. Visit: https://ollama.ai/download
2. Download the Windows installer (`.exe` file)
3. Run the installer
4. **Restart your PowerShell/terminal** after installation
5. Verify installation:
   ```powershell
   ollama --version
   ```

#### Option 2: Using Winget (Windows Package Manager)
```powershell
winget install Ollama.Ollama
```

#### Option 3: Using Chocolatey
```powershell
choco install ollama
```

### Start Ollama Service:
After installation, Ollama should start automatically. If not:

```powershell
# Start Ollama (usually runs as a service)
ollama serve
```

Or check if it's running:
```powershell
# Test if Ollama API is accessible
curl http://localhost:11434/api/tags
```

### Pull the Required Model:
```powershell
ollama pull phi3
```

### Verify Ollama Setup:
```powershell
ollama --version
ollama list  # Should show phi3
```

---

## ✅ Complete Setup Checklist for Windows

1. **Docker Desktop:**
   - [ ] Docker Desktop is installed
   - [ ] Docker Desktop is running (check system tray)
   - [ ] `docker --version` works
   - [ ] `docker ps` works (no errors)
   - [ ] `docker pull ubuntu:latest` succeeds

2. **WSL2:**
   - [ ] WSL2 is installed (`wsl --version`)
   - [ ] WSL2 is updated to latest version

3. **Ollama:**
   - [ ] Ollama is installed
   - [ ] `ollama --version` works
   - [ ] Ollama service is running
   - [ ] `ollama pull phi3` completed successfully
   - [ ] `ollama list` shows phi3 model

4. **Test Both Services:**
   ```powershell
   # Test Docker
   docker run --rm ubuntu:latest echo "Docker works!"
   
   # Test Ollama
   curl http://localhost:11434/api/tags
   ```

---

## 🚨 Quick Fixes

### If Docker Desktop won't start:
```powershell
# Run as Administrator
net stop com.docker.service
net start com.docker.service
```

### If Ollama command not found after installation:
1. Close and reopen PowerShell/terminal
2. Check if Ollama is in PATH:
   ```powershell
   $env:Path -split ';' | Select-String -Pattern "ollama"
   ```
3. If not, add manually or reinstall Ollama

### Check if services are running:
```powershell
# Check Docker service
Get-Service -Name "*docker*"

# Check if Ollama is listening
Test-NetConnection -ComputerName localhost -Port 11434
```

---

## 📝 Next Steps

Once both services are working:

1. **Pull Docker image:**
   ```powershell
   docker pull ubuntu:latest
   ```

2. **Pull Ollama model:**
   ```powershell
   ollama pull phi3
   ```

3. **Start the backend:**
   ```powershell
   cd backend
   python app.py
   ```

4. **Start the frontend (new terminal):**
   ```powershell
   cd frontend
   npm start
   ```

---

## 💡 Still Having Issues?

### Docker Desktop Issues:
- Check Docker Desktop logs: `%LOCALAPPDATA%\Docker\log.txt`
- Try running Docker Desktop as Administrator
- Ensure Windows updates are installed
- Check if antivirus is blocking Docker

### Ollama Issues:
- Ensure Windows Firewall allows Ollama
- Check if port 11434 is already in use
- Try running Ollama as Administrator
- Check Ollama logs (usually in `%USERPROFILE%\.ollama\`)

