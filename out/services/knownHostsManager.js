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
exports.KnownHostsManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class KnownHostsManager {
    constructor(sshPath = '~/.ssh') {
        this.knownHostsPath = path.join(sshPath.replace(/^~/, process.env.HOME || ''), 'known_hosts');
    }
    parseKnownHosts() {
        if (!fs.existsSync(this.knownHostsPath))
            return [];
        const entries = [];
        const lines = fs.readFileSync(this.knownHostsPath, 'utf-8').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#'))
                continue;
            const parts = line.split(/\s+/);
            if (parts.length < 2)
                continue;
            entries.push({
                host: parts[0],
                keyType: parts[1],
                hashed: parts[0].startsWith('|1|'),
                lineNumber: i + 1
            });
        }
        return entries.slice(0, 100);
    }
    async removeHost(lineNumber) {
        const lines = fs.readFileSync(this.knownHostsPath, 'utf-8').split('\n');
        lines.splice(lineNumber - 1, 1);
        await fs.promises.writeFile(this.knownHostsPath, lines.join('\n'));
    }
}
exports.KnownHostsManager = KnownHostsManager;
//# sourceMappingURL=knownHostsManager.js.map