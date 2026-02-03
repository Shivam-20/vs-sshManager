import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SSHKey } from '../types';

const execAsync = promisify(exec);

export class KeyManager {
  private sshPath: string;

  constructor(sshPath: string = '~/.ssh') {
    this.sshPath = sshPath.replace(/^~/, process.env.HOME || '');
  }

  async listKeys(): Promise<SSHKey[]> {
    const keys: SSHKey[] = [];
    const patterns = ['id_rsa', 'id_ed25519', 'id_ecdsa', 'id_dsa'];
    
    if (!fs.existsSync(this.sshPath)) return keys;

    const files = fs.readdirSync(this.sshPath);
    
    for (const file of files) {
      const match = patterns.find(p => file.startsWith(p) && !file.includes('.pub'));
      if (match) {
        const keyPath = path.join(this.sshPath, file);
        const keyInfo = await this.getKeyInfo(keyPath);
        if (keyInfo) keys.push(keyInfo);
      }
    }
    return keys;
  }

  async generateKey(type: string, comment: string, passphrase?: string): Promise<SSHKey> {
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

    return (await this.getKeyInfo(keyPath))!;
  }

  async deleteKey(keyPath: string): Promise<void> {
    const expanded = keyPath.replace(/^~/, process.env.HOME || '');
    await fs.promises.unlink(expanded);
    const pubPath = expanded + '.pub';
    if (fs.existsSync(pubPath)) {
      await fs.promises.unlink(pubPath);
    }
  }

  async getKeyInfo(keyPath: string): Promise<SSHKey | null> {
    try {
      const content = fs.readFileSync(keyPath, 'utf-8');
      const type = this.detectType(content);
      if (!type) return null;

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
        type: type as SSHKey['type'],
        publicKey,
        comment,
        fingerprint,
        hasPassphrase
      };
    } catch {
      return null;
    }
  }

  private detectType(content: string): string | null {
    if (content.includes('OPENSSH PRIVATE KEY')) return 'ed25519';
    if (content.includes('RSA PRIVATE KEY')) return 'rsa';
    if (content.includes('EC PRIVATE KEY')) return 'ecdsa';
    if (content.includes('DSA PRIVATE KEY')) return 'dsa';
    return null;
  }

  private async getFingerprint(keyPath: string): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync(`ssh-keygen -lf ${keyPath} 2>/dev/null`);
      return stdout.trim().split(' ')[1];
    } catch {
      return undefined;
    }
  }

  private async checkPassphrase(keyPath: string): Promise<boolean> {
    try {
      const { stderr } = await execAsync(`ssh-keygen -y -P '' -f ${keyPath} 2>&1`);
      return stderr.includes('passphrase') || stderr.length > 0;
    } catch {
      return true;
    }
  }

  exportPublicKey(keyPath: string): string | null {
    const pubPath = keyPath + '.pub';
    if (fs.existsSync(pubPath)) {
      return fs.readFileSync(pubPath, 'utf-8').trim();
    }
    return null;
  }
}
