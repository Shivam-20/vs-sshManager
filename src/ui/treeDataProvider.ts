import * as vscode from 'vscode';
import { KeyManager } from '../services/keyManager';
import { ConfigParser } from '../services/configParser';
import { KnownHostsManager } from '../services/knownHostsManager';
import { SSHAgentManager } from '../services/sshAgentManager';
import { TreeItem } from './treeItem';

export class SSHManagerTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private keyManager: KeyManager,
    private configParser: ConfigParser,
    private knownHostsManager: KnownHostsManager,
    private agentManager: SSHAgentManager
  ) { }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    if (!element) {
      return this.getRootItems();
    }

    switch (element.type) {
      case 'keys-folder':
        return this.getKeyItems();
      case 'config-folder':
        return this.getHostItems();
      case 'known-hosts-folder':
        return this.getKnownHostItems();
      case 'agent-folder':
        return this.getAgentItems();
      default:
        return [];
    }
  }

  private async getRootItems(): Promise<TreeItem[]> {
    const keys = await this.keyManager.listKeys();
    const hosts = await this.configParser.parseConfig();
    const knownHosts = this.knownHostsManager.parseKnownHosts();
    const agentStatus = await this.agentManager.checkAgentStatus();

    const items: TreeItem[] = [];

    const keysFolder = new TreeItem(
      'SSH Keys',
      vscode.TreeItemCollapsibleState.Collapsed,
      'keys-folder'
    );
    keysFolder.description = `${keys.length} keys`;
    keysFolder.iconPath = new vscode.ThemeIcon('key');
    items.push(keysFolder);

    const configFolder = new TreeItem(
      'SSH Config',
      vscode.TreeItemCollapsibleState.Collapsed,
      'config-folder'
    );
    configFolder.description = `${hosts.length} hosts`;
    configFolder.iconPath = new vscode.ThemeIcon('server');
    items.push(configFolder);

    const knownHostsFolder = new TreeItem(
      'Known Hosts',
      vscode.TreeItemCollapsibleState.Collapsed,
      'known-hosts-folder'
    );
    knownHostsFolder.description = `${knownHosts.length} entries`;
    knownHostsFolder.iconPath = new vscode.ThemeIcon('globe');
    items.push(knownHostsFolder);

    const agentFolder = new TreeItem(
      'SSH Agent',
      vscode.TreeItemCollapsibleState.Collapsed,
      'agent-folder'
    );
    agentFolder.description = agentStatus.running ? 'Running' : 'Not running';
    agentFolder.iconPath = new vscode.ThemeIcon('zap');
    items.push(agentFolder);

    return items;
  }

  private async getKeyItems(): Promise<TreeItem[]> {
    const keys = await this.keyManager.listKeys();
    return keys.map(key => {
      const item = new TreeItem(
        key.path.split('/').pop() || key.path,
        vscode.TreeItemCollapsibleState.None,
        'ssh-key'
      );
      item.description = key.type.toUpperCase();
      item.iconPath = new vscode.ThemeIcon(key.hasPassphrase ? 'lock' : 'key');
      item.tooltip = `Type: ${key.type}\nFingerprint: ${key.fingerprint || 'N/A'}\nComment: ${key.comment || 'N/A'}`;
      item.contextValue = 'ssh-key';
      item.resourceData = key.path;
      return item;
    });
  }

  private async getHostItems(): Promise<TreeItem[]> {
    const hosts = await this.configParser.parseConfig();
    return hosts.map(host => {
      const item = new TreeItem(
        host.name,
        vscode.TreeItemCollapsibleState.None,
        'ssh-host'
      );
      const details = [host.hostName, host.user, host.port].filter(Boolean).join(' @ ');
      item.description = details || 'No details';
      item.iconPath = new vscode.ThemeIcon('server');
      item.tooltip = `Name: ${host.name}\nHostName: ${host.hostName || 'N/A'}\nUser: ${host.user || 'N/A'}\nPort: ${host.port || 22}`;
      item.contextValue = 'ssh-host';
      item.resourceData = host.name;
      return item;
    });
  }

  private getKnownHostItems(): TreeItem[] {
    const entries = this.knownHostsManager.parseKnownHosts();
    return entries.map(entry => {
      const displayName = entry.hashed
        ? `hashed (${entry.host.substring(0, 20)}...)`
        : entry.host;
      const item = new TreeItem(
        displayName,
        vscode.TreeItemCollapsibleState.None,
        'known-host'
      );
      item.description = entry.keyType;
      item.iconPath = new vscode.ThemeIcon('globe');
      item.contextValue = 'known-host';
      item.resourceData = entry.lineNumber.toString();
      return item;
    });
  }

  private async getAgentItems(): Promise<TreeItem[]> {
    const status = await this.agentManager.checkAgentStatus();
    const items: TreeItem[] = [];

    const statusItem = new TreeItem(
      status.running ? 'Status: Running' : 'Status: Not Running',
      vscode.TreeItemCollapsibleState.None,
      'agent-status'
    );
    statusItem.iconPath = new vscode.ThemeIcon(status.running ? 'check' : 'x');
    items.push(statusItem);

    if (status.running && status.identities && status.identities.length > 0) {
      const countItem = new TreeItem(
        `${status.identities.length} identities loaded`,
        vscode.TreeItemCollapsibleState.None,
        'agent-count'
      );
      countItem.iconPath = new vscode.ThemeIcon('list-ordered');
      items.push(countItem);

      status.identities.forEach(identity => {
        const item = new TreeItem(
          identity.comment || identity.type,
          vscode.TreeItemCollapsibleState.None,
          'agent-identity'
        );
        item.description = identity.type;
        item.iconPath = new vscode.ThemeIcon('key');
        items.push(item);
      });
    }

    return items;
  }
}
