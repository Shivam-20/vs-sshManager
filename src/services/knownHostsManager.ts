import * as fs from 'fs';
import * as path from 'path';
import { KnownHostEntry } from '../types';

export class KnownHostsManager {
  private knownHostsPath: string;

  constructor(sshPath: string = '~/.ssh') {
    this.knownHostsPath = path.join(
      sshPath.replace(/^~/, process.env.HOME || ''),
      'known_hosts'
    );
  }

  parseKnownHosts(): KnownHostEntry[] {
    if (!fs.existsSync(this.knownHostsPath)) return [];

    const entries: KnownHostEntry[] = [];
    const lines = fs.readFileSync(this.knownHostsPath, 'utf-8').split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      entries.push({
        host: parts[0],
        keyType: parts[1],
        hashed: parts[0].startsWith('|1|'),
        lineNumber: i + 1
      });
    }

    return entries.slice(0, 100);
  }

  async removeHost(lineNumber: number): Promise<void> {
    const lines = fs.readFileSync(this.knownHostsPath, 'utf-8').split('\n');
    lines.splice(lineNumber - 1, 1);
    await fs.promises.writeFile(this.knownHostsPath, lines.join('\n'));
  }
}
