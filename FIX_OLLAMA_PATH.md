# Fix: Ollama Not Recognized in PowerShell

## Quick Fix

After installing Ollama, you need to **restart your terminal** or refresh the PATH.

### Solution 1: Restart Terminal (Easiest)
1. **Close Cursor completely** (or just close the terminal)
2. **Reopen Cursor**
3. **Open a new terminal**
4. Try: `ollama --version`

### Solution 2: Refresh PATH in Current Terminal
Run this in your current PowerShell:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Then try:
```powershell
ollama --version
```

### Solution 3: Find and Add Ollama to PATH Manually

**Step 1: Find where Ollama is installed**
Common locations:
- `C:\Users\<YourUsername>\AppData\Local\Programs\Ollama`
- `C:\Program Files\Ollama`
- `C:\Users\<YourUsername>\AppData\Local\Microsoft\WinGet\Packages\Ollama.Ollama_<version>\ollama.exe`

**Step 2: Check if it exists**
```powershell
# Try these locations
Test-Path "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
Test-Path "C:\Program Files\Ollama\ollama.exe"
Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "ollama.exe" -ErrorAction SilentlyContinue
```

**Step 3: Add to PATH (if found)**
```powershell
# Replace with actual path if different
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$ollamaPath", "User")
$env:Path += ";$ollamaPath"
```

### Solution 4: Use Full Path (Temporary Workaround)
If you can't fix PATH right now, use the full path:

```powershell
# Try this to find Ollama
Get-Command ollama -ErrorAction SilentlyContinue
Get-ChildItem -Path "$env:LOCALAPPDATA" -Recurse -Filter "ollama.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 FullName
```

Once you find it, use the full path:
```powershell
& "C:\Users\Mc\AppData\Local\Programs\Ollama\ollama.exe" --version
& "C:\Users\Mc\AppData\Local\Programs\Ollama\ollama.exe" pull phi3
```

---

## Verify Installation

After fixing PATH, verify:

```powershell
# Check version
ollama --version

# Check if service is running
curl http://localhost:11434/api/tags

# Or test with PowerShell
Invoke-WebRequest -Uri http://localhost:11434/api/tags
```

---

## If Still Not Working

1. **Reinstall Ollama:**
   - Uninstall from Settings → Apps
   - Download fresh from: https://ollama.ai/download/windows
   - Install and **restart computer**

2. **Check Windows PATH:**
   ```powershell
   $env:Path -split ';' | Select-String -Pattern "ollama"
   ```

3. **Manual PATH addition:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "User variables", find "Path" → Edit
   - Add: `C:\Users\<YourUsername>\AppData\Local\Programs\Ollama`
   - Click OK, restart terminal

