# SSH Manager

A simple VS Code extension for managing SSH keys, config, known hosts, and agent.

## Features

- **SSH Keys**: View, generate, delete, and copy public keys
- **SSH Config**: View, add, edit, and delete host configurations
- **Known Hosts**: View and remove entries from known_hosts
- **SSH Agent**: View status and loaded identities

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for "SSH Manager"
4. Click Install

## Usage

### Opening SSH Manager

Click the SSH Manager icon in the Activity Bar (left sidebar).

### SSH Keys

- **View Keys**: Expand the "SSH Keys" folder
- **Generate Key**: Right-click "SSH Keys" folder → "Generate SSH Key"
- **Copy Public Key**: Right-click a key → "Copy Public Key"
- **Delete Key**: Right-click a key → "Delete Key"

### SSH Config

- **View Hosts**: Expand the "SSH Config" folder
- **Add Host**: Right-click "SSH Config" folder → "Add SSH Host"
- **Edit Host**: Right-click a host → "Edit Host"
- **Delete Host**: Right-click a host → "Delete Host"

### Known Hosts

- **View Entries**: Expand the "Known Hosts" folder
- **Remove Entry**: Right-click an entry → "Remove Entry"

### SSH Agent

- **View Status**: Expand the "SSH Agent" folder
- Shows running status and loaded identities

## Commands

- `SSH Manager: Refresh` - Refresh the tree view
- `SSH Manager: Generate SSH Key` - Generate a new SSH key
- `SSH Manager: Add SSH Host` - Add a new host to SSH config

## Settings

- `sshManager.sshPath` - Path to SSH directory (default: `~/.ssh`)

## Requirements

- VS Code 1.75.0 or higher
- Linux operating system
- OpenSSH client installed

## License

MIT
