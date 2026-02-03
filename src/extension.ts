import * as vscode from 'vscode';
import * as os from 'os';
import { KeyManager } from './services/keyManager';
import { ConfigParser } from './services/configParser';
import { KnownHostsManager } from './services/knownHostsManager';
import { SSHAgentManager } from './services/sshAgentManager';
import { SSHManagerTreeDataProvider } from './ui/treeDataProvider';
import { TreeItem } from './ui/treeItem';
import { SSHKey, SSHHost } from './types';

export function activate(context: vscode.ExtensionContext) {
  const sshPath = vscode.workspace.getConfiguration('sshManager').get('sshPath') as string || '~/.ssh';

  const keyManager = new KeyManager(sshPath);
  const configParser = new ConfigParser(sshPath);
  const knownHostsManager = new KnownHostsManager(sshPath);
  const agentManager = new SSHAgentManager();

  const treeDataProvider = new SSHManagerTreeDataProvider(
    keyManager,
    configParser,
    knownHostsManager,
    agentManager
  );

  const treeView = vscode.window.createTreeView('sshManagerView', {
    treeDataProvider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  const refresh = async () => treeDataProvider.refresh();

  const refreshCmd = vscode.commands.registerCommand('sshManager.refresh', refresh);

  const generateKeyCmd = vscode.commands.registerCommand('sshManager.generateKey', async () => {
    const type = await vscode.window.showQuickPick(['ed25519', 'rsa', 'ecdsa', 'dsa'], {
      placeHolder: 'Select key type'
    });
    if (!type) return;

    const comment = await vscode.window.showInputBox({
      prompt: 'Enter a comment',
      placeHolder: `${os.userInfo().username}@${os.hostname()}`,
      value: `${os.userInfo().username}@${os.hostname()}`
    });
    if (!comment) return;

    const addPassphrase = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Add passphrase?'
    });
    let passphrase: string | undefined;
    if (addPassphrase === 'Yes') {
      passphrase = await vscode.window.showInputBox({
        prompt: 'Enter passphrase',
        password: true
      });
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Generating ${type.toUpperCase()} key...`,
      cancellable: false
    }, async () => {
      await keyManager.generateKey(type, comment, passphrase);
      await refresh();
      vscode.window.showInformationMessage(`Key generated successfully`);
    });
  });

  const addHostCmd = vscode.commands.registerCommand('sshManager.addHost', async () => {
    const name = await vscode.window.showInputBox({
      prompt: 'Enter host name',
      placeHolder: 'my-server'
    });
    if (!name) return;

    const hostName = await vscode.window.showInputBox({
      prompt: 'Enter hostname or IP',
      placeHolder: '192.168.1.100'
    });
    if (!hostName) return;

    const user = await vscode.window.showInputBox({
      prompt: 'Enter username',
      placeHolder: 'root'
    });
    if (!user) return;

    const portStr = await vscode.window.showInputBox({
      prompt: 'Enter port',
      placeHolder: '22',
      value: '22'
    });
    if (!portStr) return;

    const host: SSHHost = {
      name,
      hostName,
      user,
      port: parseInt(portStr),
      otherOptions: new Map()
    };

    await configParser.addHost(host);
    await refresh();
    vscode.window.showInformationMessage(`Host '${name}' added`);
  });

  const copyPublicKeyCmd = vscode.commands.registerCommand('sshManager.copyPublicKey', async (item: TreeItem) => {
    const keyPath = item.resourceData;
    if (!keyPath) return;

    const publicKey = keyManager.exportPublicKey(keyPath);
    if (!publicKey) {
      vscode.window.showErrorMessage('Public key not found');
      return;
    }

    await vscode.env.clipboard.writeText(publicKey);
    vscode.window.showInformationMessage('Public key copied to clipboard');
  });

  const deleteKeyCmd = vscode.commands.registerCommand('sshManager.deleteKey', async (item: TreeItem) => {
    const keyPath = item.resourceData;
    if (!keyPath) return;

    const confirm = await vscode.window.showWarningMessage(
      `Delete key '${item.label}'?`,
      { modal: true },
      'Delete'
    );
    if (confirm !== 'Delete') return;

    await keyManager.deleteKey(keyPath);
    await refresh();
    vscode.window.showInformationMessage('Key deleted');
  });

  const editHostCmd = vscode.commands.registerCommand('sshManager.editHost', async (item: TreeItem) => {
    const hostName = item.resourceData;
    if (!hostName) return;

    const hosts = await configParser.parseConfig();
    const host = hosts.find(h => h.name === hostName);
    if (!host) return;

    const newHostName = await vscode.window.showInputBox({
      prompt: 'Edit hostname',
      value: host.hostName || ''
    });
    if (newHostName === undefined) return;

    const newUser = await vscode.window.showInputBox({
      prompt: 'Edit username',
      value: host.user || ''
    });
    if (newUser === undefined) return;

    const newPortStr = await vscode.window.showInputBox({
      prompt: 'Edit port',
      value: host.port?.toString() || '22'
    });
    if (newPortStr === undefined) return;

    const updatedHost: SSHHost = {
      name: host.name,
      hostName: newHostName || host.hostName,
      user: newUser || host.user,
      port: parseInt(newPortStr || '22'),
      otherOptions: host.otherOptions
    };

    await configParser.updateHost(hostName, updatedHost);
    await refresh();
    vscode.window.showInformationMessage(`Host '${hostName}' updated`);
  });

  const deleteHostCmd = vscode.commands.registerCommand('sshManager.deleteHost', async (item: TreeItem) => {
    const hostName = item.resourceData;
    if (!hostName) return;

    const confirm = await vscode.window.showWarningMessage(
      `Delete host '${hostName}'?`,
      { modal: true },
      'Delete'
    );
    if (confirm !== 'Delete') return;

    await configParser.deleteHost(hostName);
    await refresh();
    vscode.window.showInformationMessage(`Host '${hostName}' deleted`);
  });

  const removeKnownHostCmd = vscode.commands.registerCommand('sshManager.removeKnownHost', async (item: TreeItem) => {
    const lineNumber = parseInt(item.resourceData || '0');
    if (!lineNumber) return;

    const confirm = await vscode.window.showWarningMessage(
      `Remove this known host entry?`,
      { modal: true },
      'Remove'
    );
    if (confirm !== 'Remove') return;

    await knownHostsManager.removeHost(lineNumber);
    await refresh();
    vscode.window.showInformationMessage('Known host entry removed');
  });

  const copySshCommandCmd = vscode.commands.registerCommand('sshManager.copySshCommand', async (item: TreeItem) => {
    const selectedHost = item.resourceData;
    if (!selectedHost) return;

    const hosts = await configParser.parseConfig();
    const host = hosts.find(h => h.name === selectedHost);
    if (!host) {
      vscode.window.showErrorMessage(`Host '${selectedHost}' not found`);
      return;
    }

    const user = host.user || 'root';
    const hostAddress = host.hostName || 'localhost';
    const port = host.port || 22;
    const identityFile = host.identityFile ? ` -i ${host.identityFile}` : '';

    const sshCommand = `ssh ${user}@${hostAddress} -p ${port}${identityFile}`;
    await vscode.env.clipboard.writeText(sshCommand);
    vscode.window.showInformationMessage('SSH command copied to clipboard');
  });

  const testConnectionCmd = vscode.commands.registerCommand('sshManager.testConnection', async (item: TreeItem) => {
    const selectedHost = item.resourceData;
    if (!selectedHost) return;

    const hosts = await configParser.parseConfig();
    const host = hosts.find(h => h.name === selectedHost);
    if (!host) {
      vscode.window.showErrorMessage(`Host '${selectedHost}' not found`);
      return;
    }

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Testing connection to ${host.hostName || host.name}...`,
      cancellable: true
    }, async (progress, token) => {
      try {
        const user = host.user || 'root';
        const hostAddress = host.hostName || 'localhost';
        const port = host.port || 22;
        const command = `ssh -o ConnectTimeout=5 ${user}@${hostAddress} -p ${port} echo 'Connection successful' 2>&1`;

        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        await execAsync(command, { timeout: 10000 });

        return true;
      } catch (error: any) {
        const errorMessage = error.stderr || error.message || 'Unknown error';

        let suggestions: string[] = [];

        if (errorMessage.includes('Connection refused')) {
          suggestions.push('Check if SSH server is running');
          suggestions.push('Verify firewall allows SSH connections');
        } else if (errorMessage.includes('Permission denied')) {
          suggestions.push('Verify username is correct');
          suggestions.push('Try different SSH key');
        } else if (errorMessage.includes('Host key verification failed')) {
          suggestions.push('Remove host from known_hosts');
          suggestions.push('Check if server SSH key changed');
        } else if (errorMessage.includes('Host not found')) {
          suggestions.push('Check hostname spelling');
          suggestions.push('Verify DNS resolution');
        }

        const fullMessage = `Connection failed: ${errorMessage}` +
          (suggestions.length ? `\n\nSuggestions:\n• ${suggestions.join('\n• ')}` : '');

        throw new Error(fullMessage);
      }
    });
  });

  const openTerminalCmd = vscode.commands.registerCommand('sshManager.openTerminal', async (item: TreeItem) => {
    const selectedHost = item.resourceData;
    if (!selectedHost) return;

    const hosts = await configParser.parseConfig();
    const host = hosts.find(h => h.name === selectedHost);
    if (!host) {
      vscode.window.showErrorMessage(`Host '${selectedHost}' not found`);
      return;
    }

    const user = host.user || 'root';
    const hostAddress = host.hostName || 'localhost';
    const port = host.port || 22;
    const identityFile = host.identityFile ? `-i ${host.identityFile}` : '';

    const terminal = vscode.window.createTerminal(`SSH ${host.name}`, `ssh`);
    terminal.sendText(`ssh ${identityFile} ${user}@${hostAddress} -p ${port}\n`);
    terminal.show();
  });

  const viewPublicKeyCmd = vscode.commands.registerCommand('sshManager.viewPublicKey', async (item: TreeItem) => {
    const keyPath = item.resourceData;
    if (!keyPath) return;

    const publicKey = keyManager.exportPublicKey(keyPath);
    if (!publicKey) {
      vscode.window.showErrorMessage('Public key not found');
      return;
    }

    const document = await vscode.workspace.openTextDocument({
      content: publicKey,
      language: 'text'
    });
    vscode.window.showInformationMessage('Public key opened in editor');
  });

  const openSshFolderCmd = vscode.commands.registerCommand('sshManager.openSshFolder', async () => {
    const sshPath = vscode.workspace.getConfiguration('sshManager').get('sshPath') as string || '~/.ssh';
    const expandedPath = sshPath.replace(/^~/, process.env.HOME || '');

    if (!require('fs').existsSync(expandedPath)) {
      vscode.window.showErrorMessage(`SSH directory not found: ${sshPath}`);
      return;
    }

    const uri = vscode.Uri.file(expandedPath);
    await vscode.commands.executeCommand('vscode.openFolder', uri);
  });

  const openConfigFileCmd = vscode.commands.registerCommand('sshManager.openConfigFile', async () => {
    const sshPath = vscode.workspace.getConfiguration('sshManager').get('sshPath') as string || '~/.ssh';
    const expandedPath = sshPath.replace(/^~/, process.env.HOME || '');
    const configPath = require('path').join(expandedPath, 'config');

    if (!require('fs').existsSync(configPath)) {
      vscode.window.showWarningMessage('Config file not found. It will be created when you add a host.');
      return;
    }

    const uri = vscode.Uri.file(configPath);
    await vscode.window.showTextDocument(uri);
  });

  const changePassphraseCmd = vscode.commands.registerCommand('sshManager.changePassphrase', async (item: TreeItem) => {
    const keyPath = item.resourceData;
    if (!keyPath) return;

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const passphrase = await vscode.window.showInputBox({
      prompt: 'Enter new passphrase (leave empty to remove passphrase)',
      password: true
    });

    if (passphrase === undefined) return;

    try {
      const command = `ssh-keygen -p ${keyPath} -N ${JSON.stringify(passphrase)}`;
      await execAsync(command, { timeout: 30000 });
      await refresh();
      vscode.window.showInformationMessage('Passphrase changed successfully');
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to change passphrase: ${error.message}`);
    }
  });

  const removePassphraseCmd = vscode.commands.registerCommand('sshManager.removePassphrase', async (item: TreeItem) => {
    const keyPath = item.resourceData;
    if (!keyPath) return;

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      await execAsync(`ssh-keygen -p ${keyPath}`, { timeout: 30000 });
      await refresh();
      vscode.window.showInformationMessage('Passphrase removed successfully');
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to remove passphrase: ${error.message}`);
    }
  });

  context.subscriptions.push(
    refreshCmd,
    generateKeyCmd,
    addHostCmd,
    copyPublicKeyCmd,
    deleteKeyCmd,
    editHostCmd,
    deleteHostCmd,
    removeKnownHostCmd,
    copySshCommandCmd,
    testConnectionCmd,
    openTerminalCmd,
    viewPublicKeyCmd,
    openSshFolderCmd,
    openConfigFileCmd,
    changePassphraseCmd,
    removePassphraseCmd
  );
}

export function deactivate() { }
