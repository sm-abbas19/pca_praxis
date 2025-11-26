# Installing Git on Windows

Since `winget` is not available on your system, here are alternative methods to install Git:

## Method 1: Direct Download (Recommended)

1. **Download Git for Windows:**
   - Go to: https://git-scm.com/download/win
   - The download should start automatically
   - Or click the "Download for Windows" button

2. **Run the Installer:**
   - Double-click the downloaded `.exe` file (e.g., `Git-2.43.0-64-bit.exe`)
   - Follow the installation wizard:
     - **Important:** When asked about "Adjusting your PATH environment", select:
       - ✅ **"Git from the command line and also from 3rd-party software"** (Recommended)
     - Click "Next" through the remaining steps
     - Click "Install"
     - Click "Finish"

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run: `git --version`
   - You should see something like: `git version 2.43.0.windows.1`

## Method 2: Using Chocolatey (If Installed)

If you have Chocolatey package manager installed:

```powershell
choco install git
```

## Method 3: Using Scoop (If Installed)

If you have Scoop package manager installed:

```powershell
scoop install git
```

## After Installation

1. **Restart your terminal/PowerShell** (important!)

2. **Configure Git** (first time only):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

3. **Verify it works:**

```powershell
git --version
```

## Quick Installation Steps Summary

1. Visit: https://git-scm.com/download/win
2. Download the installer
3. Run the installer (use default options, but ensure PATH is set)
4. Restart your terminal
5. Test with: `git --version`

## Troubleshooting

### Git still not recognized after installation

1. **Check if Git is installed:**
   - Look for "Git Bash" in Start Menu
   - If it exists, Git is installed but PATH might not be set

2. **Add Git to PATH manually:**
   - Git is usually installed at: `C:\Program Files\Git\cmd\`
   - Add this to your system PATH:
     - Right-click "This PC" → Properties
     - Advanced system settings → Environment Variables
     - Under "System variables", find "Path" → Edit
     - Add: `C:\Program Files\Git\cmd\`
     - Click OK on all dialogs
     - Restart terminal

3. **Use Git Bash instead:**
   - Open "Git Bash" from Start Menu
   - This terminal has Git in PATH by default

## Next Steps After Installing Git

Once Git is installed, you can proceed with pushing your changes:

```powershell
cd C:\Users\Mc\Downloads\pca_praxis-main\pca_praxis-main
git --version  # Verify it works
```

Then follow the steps in `PUSH_TO_BRANCH.md`

