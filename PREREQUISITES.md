# Prerequisites Checklist

This project **REQUIRES** both Docker and Ollama to function properly. Follow this checklist before running the application.

## ✅ Required Services

### 1. Docker Engine
**Why:** Used by `sandbox.py` to execute commands in isolated containers.

**Installation:**
- **Linux:** 
  ```bash
  sudo apt-get update
  sudo apt-get install docker.io
  sudo systemctl start docker
  sudo systemctl enable docker
  ```
- **Windows:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **macOS:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Verification:**
```bash
docker --version
docker ps  # Should return empty list or running containers (no errors)
```

**Required Image:**
```bash
docker pull ubuntu:latest
```

**Linux Permissions (if needed):**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

### 2. Ollama
**Why:** Used by `llm_engine.py` to convert natural language to Bash commands.

**Installation:**
- Visit [ollama.ai](https://ollama.ai) and download for your OS
- **Linux/Mac:** 
  ```bash
  curl -fsSL https://ollama.ai/install.sh | sh
  ```
- **Windows:** Download installer from [ollama.ai/download](https://ollama.ai/download)

**Start Ollama Service:**
```bash
# Linux/Mac (usually auto-starts)
ollama serve

# Or run in background
ollama serve &
```

**Verification:**
```bash
ollama --version
ollama list  # Should show available models
```

**Required Model:**
```bash
ollama pull phi3
```

**Verify Model:**
```bash
ollama list  # Should show 'phi3' in the list
```

**Test Connection:**
```bash
curl http://localhost:11434/api/tags  # Should return JSON with models
```

---

## 🚨 Troubleshooting

### Docker Issues

**Error: "Cannot connect to Docker daemon"**
- Ensure Docker service is running: `sudo systemctl status docker`
- Start Docker: `sudo systemctl start docker`
- Check permissions (Linux): Add user to docker group (see above)

**Error: "docker: command not found"**
- Docker is not installed or not in PATH
- Reinstall Docker following official guide

### Ollama Issues

**Error: "Connection refused" when accessing localhost:11434**
- Ollama service is not running
- Start Ollama: `ollama serve` (or restart the service)

**Error: "model 'phi3' not found"**
- Pull the model: `ollama pull phi3`
- Verify: `ollama list`

**Error: "ollama: command not found"**
- Ollama is not installed or not in PATH
- Reinstall Ollama following official guide

---

## ✅ Final Checklist

Before running the application, verify:

- [ ] Docker is installed and running (`docker ps` works)
- [ ] Docker image `ubuntu:latest` is pulled (`docker images | grep ubuntu`)
- [ ] Ollama is installed and running (`ollama list` works)
- [ ] Ollama model `phi3` is available (`ollama list | grep phi3`)
- [ ] Ollama API is accessible (`curl http://localhost:11434/api/tags` returns JSON)
- [ ] (Linux only) User has Docker permissions (can run `docker ps` without sudo)

---

## 🎯 Quick Test

Run these commands to verify everything is set up:

```bash
# Test Docker
docker run --rm ubuntu:latest echo "Docker works!"

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "phi3",
  "prompt": "Say hello",
  "stream": false
}'
```

If both commands succeed, you're ready to run the application!

