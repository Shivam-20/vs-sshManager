import { exec } from 'child_process';
import { promisify } from 'util';
import { SSHAgentStatus, SSHAgentIdentity } from '../types';

const execAsync = promisify(exec);

export class SSHAgentManager {
  async checkAgentStatus(): Promise<SSHAgentStatus> {
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
    } catch {
      return { running: false };
    }
  }

  private async listIdentities(): Promise<SSHAgentIdentity[]> {
    try {
      const { stdout } = await execAsync('ssh-add -l 2>/dev/null');
      if (stdout.trim() === '' || stdout.includes('no identities')) {
        return [];
      }

      const identities: SSHAgentIdentity[] = [];
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
    } catch {
      return [];
    }
  }
}
