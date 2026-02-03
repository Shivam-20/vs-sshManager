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
exports.KeyManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class KeyManager {
    constructor(sshPath = '~/.ssh') {
        this.sshPath = sshPath.replace(/^~/, process.env.HOME || '');
    }
    async listKeys() {
        const keys = [];
        const patterns = ['id_rsa', 'id_ed25519', 'id_ecdsa', 'id_dsa'];
        if (!fs.existsSync(this.sshPath))
            return keys;
        const files = fs.readdirSync(this.sshPath);
        for (const file of files) {
            const match = patterns.find(p => file.startsWith(p) && !file.includes('.pub'));
            if (match) {
                const keyPath = path.join(this.sshPath, file);
                const keyInfo = await this.getKeyInfo(keyPath);
                if (keyInfo)
                    keys.push(keyInfo);
            }
        }
        return keys;
    }
    async generateKey(type, comment, passphrase) {
        const keyPath = path.join(this.sshPath, `id_${type}`);
        if (!fs.existsSync(this.sshPath)) {
            fs.mkdirSync(this.sshPath, { recursive: true });
        }
        const cmd = `ssh-keygen -t ${type} -f ${keyPath} -C ${JSON.stringify(comment)} -N ${JSON.stringify(passphrase || '')}`;
        await execAsync(cmd, { timeout: 30000 });
        await fs.promises.chmod(keyPath, 0o600);
        const pubPath = keyPath + '.pub';
        if (fs.existsSync(pubPath)) {
            await fs.promises.chmod(pubPath, 0o644);
        }
        return (await this.getKeyInfo(keyPath));
    }
    async deleteKey(keyPath) {
        const expanded = keyPath.replace(/^~/, process.env.HOME || '');
        await fs.promises.unlink(expanded);
        const pubPath = expanded + '.pub';
        if (fs.existsSync(pubPath)) {
            await fs.promises.unlink(pubPath);
        }
    }
    async getKeyInfo(keyPath) {
        try {
            const content = fs.readFileSync(keyPath, 'utf-8');
            const type = this.detectType(content);
            if (!type)
                return null;
            const fingerprint = await this.getFingerprint(keyPath);
            const hasPassphrase = await this.checkPassphrase(keyPath);
            const pubPath = keyPath + '.pub';
            let publicKey = '';
            let comment = '';
            if (fs.existsSync(pubPath)) {
                publicKey = fs.readFileSync(pubPath, 'utf-8').trim();
                const parts = publicKey.split(' ');
                if (parts.length >= 3) {
                    comment = parts.slice(2).join(' ').trim();
                }
            }
            return {
                path: keyPath,
                type: type,
                publicKey,
                comment,
                fingerprint,
                hasPassphrase
            };
        }
        catch {
            return null;
        }
    }
    detectType(content) {
        if (content.includes('OPENSSH PRIVATE KEY'))
            return 'ed25519';
        if (content.includes('RSA PRIVATE KEY'))
            return 'rsa';
        if (content.includes('EC PRIVATE KEY'))
            return 'ecdsa';
        if (content.includes('DSA PRIVATE KEY'))
            return 'dsa';
        return null;
    }
    async getFingerprint(keyPath) {
        try {
            const { stdout } = await execAsync(`ssh-keygen -lf ${keyPath} 2>/dev/null`);
            return stdout.trim().split(' ')[1];
        }
        catch {
            return undefined;
        }
    }
    async checkPassphrase(keyPath) {
        try {
            const { stderr } = await execAsync(`ssh-keygen -y -P '' -f ${keyPath} 2>&1`);
            return stderr.includes('passphrase') || stderr.length > 0;
        }
        catch {
            return true;
        }
    }
    exportPublicKey(keyPath) {
        const pubPath = keyPath + '.pub';
        if (fs.existsSync(pubPath)) {
            return fs.readFileSync(pubPath, 'utf-8').trim();
        }
        return null;
    }
}
exports.KeyManager = KeyManager;
//# sourceMappingURL=keyManager.js.map