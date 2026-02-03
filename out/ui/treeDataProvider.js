"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHManagerTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const treeItem_1 = require("./treeItem");
class SSHManagerTreeDataProvider {
    constructor(keyManager, configParser, knownHostsManager, agentManager) {
        this.keyManager = keyManager;
        this.configParser = configParser;
        this.knownHostsManager = knownHostsManager;
        this.agentManager = agentManager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
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
    async getRootItems() {
        const keys = await this.keyManager.listKeys();
        const hosts = await this.configParser.parseConfig();
        const knownHosts = this.knownHostsManager.parseKnownHosts();
        const agentStatus = await this.agentManager.checkAgentStatus();
        const items = [];
        const keysFolder = new treeItem_1.TreeItem('SSH Keys', vscode.TreeItemCollapsibleState.Collapsed, 'keys-folder');
        keysFolder.description = `${keys.length} keys`;
        keysFolder.iconPath = new vscode.ThemeIcon('key');
        items.push(keysFolder);
        const configFolder = new treeItem_1.TreeItem('SSH Config', vscode.TreeItemCollapsibleState.Collapsed, 'config-folder');
        configFolder.description = `${hosts.length} hosts`;
        configFolder.iconPath = new vscode.ThemeIcon('server');
        items.push(configFolder);
        const knownHostsFolder = new treeItem_1.TreeItem('Known Hosts', vscode.TreeItemCollapsibleState.Collapsed, 'known-hosts-folder');
        knownHostsFolder.description = `${knownHosts.length} entries`;
        knownHostsFolder.iconPath = new vscode.ThemeIcon('globe');
        items.push(knownHostsFolder);
        const agentFolder = new treeItem_1.TreeItem('SSH Agent', vscode.TreeItemCollapsibleState.Collapsed, 'agent-folder');
        agentFolder.description = agentStatus.running ? 'Running' : 'Not running';
        agentFolder.iconPath = new vscode.ThemeIcon('zap');
        items.push(agentFolder);
        return items;
    }
    async getKeyItems() {
        const keys = await this.keyManager.listKeys();
        return keys.map(key => {
            const item = new treeItem_1.TreeItem(key.path.split('/').pop() || key.path, vscode.TreeItemCollapsibleState.None, 'ssh-key');
            item.description = key.type.toUpperCase();
            item.iconPath = new vscode.ThemeIcon(key.hasPassphrase ? 'lock' : 'key');
            item.tooltip = `Type: ${key.type}\nFingerprint: ${key.fingerprint || 'N/A'}\nComment: ${key.comment || 'N/A'}`;
            item.contextValue = 'ssh-key';
            item.resourceData = key.path;
            return item;
        });
    }
    async getHostItems() {
        const hosts = await this.configParser.parseConfig();
        return hosts.map(host => {
            const item = new treeItem_1.TreeItem(host.name, vscode.TreeItemCollapsibleState.None, 'ssh-host');
            const details = [host.hostName, host.user, host.port].filter(Boolean).join(' @ ');
            item.description = details || 'No details';
            item.iconPath = new vscode.ThemeIcon('server');
            item.tooltip = `Name: ${host.name}\nHostName: ${host.hostName || 'N/A'}\nUser: ${host.user || 'N/A'}\nPort: ${host.port || 22}`;
            item.contextValue = 'ssh-host';
            item.resourceData = host.name;
            return item;
        });
    }
    getKnownHostItems() {
        const entries = this.knownHostsManager.parseKnownHosts();
        return entries.map(entry => {
            const displayName = entry.hashed
                ? `hashed (${entry.host.substring(0, 20)}...)`
                : entry.host;
            const item = new treeItem_1.TreeItem(displayName, vscode.TreeItemCollapsibleState.None, 'known-host');
            item.description = entry.keyType;
            item.iconPath = new vscode.ThemeIcon('globe');
            item.contextValue = 'known-host';
            item.resourceData = entry.lineNumber.toString();
            return item;
        });
    }
    async getAgentItems() {
        const status = await this.agentManager.checkAgentStatus();
        const items = [];
        const statusItem = new treeItem_1.TreeItem(status.running ? 'Status: Running' : 'Status: Not Running', vscode.TreeItemCollapsibleState.None, 'agent-status');
        statusItem.iconPath = new vscode.ThemeIcon(status.running ? 'check' : 'x');
        items.push(statusItem);
        if (status.running && status.identities && status.identities.length > 0) {
            const countItem = new treeItem_1.TreeItem(`${status.identities.length} identities loaded`, vscode.TreeItemCollapsibleState.None, 'agent-count');
            countItem.iconPath = new vscode.ThemeIcon('list-ordered');
            items.push(countItem);
            status.identities.forEach(identity => {
                const item = new treeItem_1.TreeItem(identity.comment || identity.type, vscode.TreeItemCollapsibleState.None, 'agent-identity');
                item.description = identity.type;
                item.iconPath = new vscode.ThemeIcon('key');
                items.push(item);
            });
        }
        return items;
    }
}
exports.SSHManagerTreeDataProvider = SSHManagerTreeDataProvider;
//# sourceMappingURL=treeDataProvider.js.map