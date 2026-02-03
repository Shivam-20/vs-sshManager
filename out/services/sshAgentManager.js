"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHAgentManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class SSHAgentManager {
    async checkAgentStatus() {
        const authSock = process.env.SSH_AUTH_SOCK;
        if (!authSock) {
            return { running: false };
        }
        try {
            const identities = await this.listIdentities();
            return {
                running: true,
                identities
            };
        }
        catch {
            return { running: false };
        }
    }
    async listIdentities() {
        try {
            const { stdout } = await execAsync('ssh-add -l 2>/dev/null');
            if (stdout.trim() === '' || stdout.includes('no identities')) {
                return [];
            }
            const identities = [];
            const lines = stdout.trim().split('\n');
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    identities.push({
                        fingerprint: parts[1],
                        type: parts[1].includes('RSA') ? 'RSA' :
                            parts[1].includes('ED25519') ? 'ED25519' :
                                parts[1].includes('ECDSA') ? 'ECDSA' : 'UNKNOWN',
                        comment: parts.slice(2).join(' ')
                    });
                }
            }
            return identities;
        }
        catch {
            return [];
        }
    }
}
exports.SSHAgentManager = SSHAgentManager;
//# sourceMappingURL=sshAgentManager.js.map