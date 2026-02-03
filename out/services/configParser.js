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
exports.ConfigParser = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigParser {
    constructor(sshPath = '~/.ssh') {
        this.configPath = path.join(sshPath.replace(/^~/, process.env.HOME || ''), 'config');
    }
    async parseConfig() {
        if (!fs.existsSync(this.configPath))
            return [];
        const content = fs.readFileSync(this.configPath, 'utf-8');
        return this.parseContent(content);
    }
    parseContent(content) {
        const hosts = [];
        const lines = content.split('\n');
        let currentHost = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const [directive, ...args] = trimmed.split(/\s+/);
            const value = args.join(' ');
            if (directive.toLowerCase() === 'host') {
                if (currentHost)
                    hosts.push(currentHost);
                currentHost = {
                    name: value,
                    otherOptions: new Map()
                };
            }
            else if (currentHost) {
                const dirLower = directive.toLowerCase();
                switch (dirLower) {
                    case 'hostname':
                        currentHost.hostName = value;
                        break;
                    case 'user':
                        currentHost.user = value;
                        break;
                    case 'port':
                        currentHost.port = parseInt(value);
                        break;
                    case 'identityfile':
                        currentHost.identityFile = value;
                        break;
                    default:
                        currentHost.otherOptions.set(directive, value);
                }
            }
        }
        if (currentHost)
            hosts.push(currentHost);
        return hosts;
    }
    async addHost(host) {
        const content = fs.existsSync(this.configPath)
            ? fs.readFileSync(this.configPath, 'utf-8')
            : '';
        const entry = this.hostToConfig(host);
        const newContent = content + (content ? '\n' : '') + entry + '\n';
        await fs.promises.writeFile(this.configPath, newContent);
    }
    async updateHost(name, host) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const lines = content.split('\n');
        const newLines = [];
        let inHost = false;
        let skip = false;
        for (const line of lines) {
            const trimmed = line.trim();
            const [directive, ...args] = trimmed.split(/\s+/);
            if (directive.toLowerCase() === 'host') {
                if (inHost && skip)
                    skip = false;
                inHost = true;
                if (args[0] === name) {
                    skip = true;
                    newLines.push(this.hostToConfig(host));
                    continue;
                }
            }
            if (!skip)
                newLines.push(line);
        }
        await fs.promises.writeFile(this.configPath, newLines.join('\n'));
    }
    async deleteHost(name) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const lines = content.split('\n');
        const newLines = [];
        let inHost = false;
        let skip = false;
        for (const line of lines) {
            const trimmed = line.trim();
            const [directive, ...args] = trimmed.split(/\s+/);
            if (directive?.toLowerCase() === 'host') {
                if (inHost && skip)
                    skip = false;
                inHost = true;
                if (args[0] === name) {
                    skip = true;
                    continue;
                }
            }
            if (!skip)
                newLines.push(line);
        }
        await fs.promises.writeFile(this.configPath, newLines.join('\n'));
    }
    hostToConfig(host) {
        const lines = [`Host ${host.name}`];
        if (host.hostName)
            lines.push(`  HostName ${host.hostName}`);
        if (host.user)
            lines.push(`  User ${host.user}`);
        if (host.port)
            lines.push(`  Port ${host.port}`);
        if (host.identityFile)
            lines.push(`  IdentityFile ${host.identityFile}`);
        host.otherOptions.forEach((value, key) => {
            lines.push(`  ${key} ${value}`);
        });
        return lines.join('\n');
    }
}
exports.ConfigParser = ConfigParser;
//# sourceMappingURL=configParser.js.map