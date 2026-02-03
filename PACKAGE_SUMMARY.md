# SSH Manager Extension - VSIX Package Complete! 📦

## Package Created Successfully ✅

**File:** `ssh-manager-1.0.0.vsix`
**Size:** 14 KB
**Location:** `/media/system04/4E36DB0524ADCE651/Project/Vs extension's/sshManager/sshManager/`

---

## Package Contents

```
ssh-manager-1.0.0.vsix (13 files, 13.91 KB)
├─ package.json (3.42 KB)
├─ readme.md
├─ resources/
│  └─ icon.svg (0.27 KB)
└─ out/
   ├─ extension.js (8.77 KB)
   ├─ services/
   │  ├─ configParser.js (5.93 KB)
   │  ├─ keyManager.js (5.49 KB)
   │  ├─ knownHostsManager.js (2.72 KB)
   │  └─ sshAgentManager.js (1.71 KB)
   ├─ types/
   │  └─ index.js (0.11 KB)
   └─ ui/
      ├─ treeDataProvider.js (7.11 KB)
      └─ treeItem.js (1.72 KB)
```

---

## Installation Instructions

### Method 1: Install from VSIX File

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Click the `...` menu (three dots) in the top-right corner
4. Select **"Install from VSIX..."**
5. Navigate to and select `ssh-manager-1.0.0.vsix`
6. Click **Install**
7. Reload VS Code when prompted

### Method 2: Command Line Installation

```bash
code --install-extension ssh-manager-1.0.0.vsix
```

### Method 3: Development (Testing)

If you want to test/develop the extension:

1. Open the `sshManager` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window will open with the extension loaded

---

## After Installation

Once installed, you'll see:

1. **SSH Manager icon** in the Activity Bar (left sidebar)
2. Click the icon to open the SSH Manager tree view
3. Expand folders to see your SSH resources

---

## Quick Start Guide

### SSH Keys

- **View Keys:** Expand "SSH Keys" folder
- **Generate Key:** Right-click "SSH Keys" folder → "Generate SSH Key"
- **Copy Public Key:** Right-click a key → "Copy Public Key"
- **Delete Key:** Right-click a key → "Delete Key"

### SSH Config

- **View Hosts:** Expand "SSH Config" folder
- **Add Host:** Right-click "SSH Config" folder → "Add SSH Host"
- **Edit Host:** Right-click a host → "Edit Host"
- **Delete Host:** Right-click a host → "Delete Host"

### Known Hosts

- **View Entries:** Expand "Known Hosts" folder
- **Remove Entry:** Right-click an entry → "Remove Entry"

### SSH Agent

- **View Status:** Expand "SSH Agent" folder
- Shows if agent is running and loaded identities

---

## Available Commands

Press `Ctrl+Shift+P` to open Command Palette:

- `SSH Manager: Refresh` - Refresh the tree view
- `SSH Manager: Generate SSH Key` - Generate a new SSH key
- `SSH Manager: Add SSH Host` - Add a new host to config

---

## Configuration

Open VS Code Settings (`Ctrl+,`) and search for "SSH Manager":

- **sshManager.sshPath** - Path to SSH directory (default: `~/.ssh`)

---

## Extension Features

### ✅ SSH Keys
- List all SSH keys in `~/.ssh`
- Generate new keys (ed25519, rsa, ecdsa, dsa)
- Copy public key to clipboard
- Delete keys
- Show key details (type, fingerprint, passphrase status)

### ✅ SSH Config
- List all hosts from `~/.ssh/config`
- Add new hosts with prompts
- Edit existing host configurations
- Delete hosts

### ✅ Known Hosts
- View entries from `~/.ssh/known_hosts`
- Remove entries (max 100 displayed for performance)

### ✅ SSH Agent
- Check if SSH agent is running
- View loaded identities (keys in agent)

---

## Technical Details

- **Platform:** Linux
- **VS Code Version:** 1.75.0+
- **TypeScript Version:** 5.x
- **Node.js Version:** 18.x
- **Runtime Dependencies:** 0 (uses only Node.js built-ins)
- **Dev Dependencies:** @types/node, @types/vscode, typescript, @vscode/vsce

---

## Requirements

- Visual Studio Code 1.75.0 or higher
- Linux operating system
- OpenSSH client installed (`ssh`, `ssh-keygen` commands available)

---

## Troubleshooting

### Extension doesn't appear after installation
1. Reload VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check that SSH is installed (`which ssh`)

### Commands not working
1. Check that you have proper permissions on `~/.ssh` directory
2. Verify SSH tools are installed (`ssh-keygen`, `ssh-add`)

### Tree view not showing data
1. Click the **Refresh** button in the tree view toolbar
2. Check SSH directory path in settings

---

## Security Notes

- ✅ Private keys are never logged or displayed
- ✅ Passphrases are input via secure password fields
- ✅ Proper file permissions set (600 for private keys, 644 for public keys)
- ✅ Confirmation dialogs for all destructive actions
- ✅ No credential storage built-in

---

## License

MIT License

---

## Support

For issues or feature requests, please open an issue on the project repository.

---

**Built with ❤️ in 2026**
**Package created with vsce (VSCode Extension Manager)**
