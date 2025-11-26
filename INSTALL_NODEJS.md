# Install Node.js on Windows

## Quick Installation

### Option 1: Download Installer (Recommended - Easiest)

1. **Visit:** https://nodejs.org/
2. **Download:** Click the "LTS" (Long Term Support) version button
   - This will download a `.msi` installer (e.g., `node-v20.x.x-x64.msi`)
3. **Run the installer:**
   - Double-click the downloaded file
   - Click "Next" through the installation wizard
   - **IMPORTANT:** Make sure "Add to PATH" is checked (should be by default)
   - Click "Install"
4. **Restart your terminal:**
   - Close Cursor completely
   - Reopen Cursor
   - Open a new terminal
5. **Verify installation:**
   ```powershell
   node --version
   npm --version
   ```

### Option 2: Using Winget (Windows Package Manager)

If you have Winget installed:

```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your terminal and verify:
```powershell
node --version
npm --version
```

### Option 3: Using Chocolatey

If you have Chocolatey installed:

```powershell
choco install nodejs-lts
```

Then restart your terminal and verify:
```powershell
node --version
npm --version
```

---

## After Installation

Once Node.js is installed:

1. **Close and reopen Cursor** (or just close and reopen the terminal)

2. **Verify it works:**
   ```powershell
   node --version
   npm --version
   ```

3. **Then continue with frontend setup:**
   ```powershell
   cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main\frontend
   npm install
   npm start
   ```

---

## Troubleshooting

### If `node` or `npm` still not recognized after installation:

1. **Check if Node.js is installed:**
   - Look in: `C:\Program Files\nodejs\`
   - Or: `C:\Users\Mc\AppData\Local\Programs\nodejs\`

2. **Add to PATH manually:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "User variables", find "Path" → Edit
   - Add: `C:\Program Files\nodejs` (or wherever Node.js is installed)
   - Click OK on all windows
   - **Restart terminal**

3. **Verify PATH:**
   ```powershell
   $env:Path -split ';' | Select-String -Pattern "node"
   ```

---

## What You Should See After Installation

```powershell
PS> node --version
v20.11.0  # (or similar version number)

PS> npm --version
10.2.4  # (or similar version number)
```

---

## Next Steps

Once Node.js is installed and verified:

1. Navigate to frontend:
   ```powershell
   cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start frontend:
   ```powershell
   npm start
   ```

