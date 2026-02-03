import * as fs from 'fs';
import * as path from 'path';
import { SSHHost } from '../types';

export class ConfigParser {
  private configPath: string;

  constructor(sshPath: string = '~/.ssh') {
    this.configPath = path.join(
      sshPath.replace(/^~/, process.env.HOME || ''),
      'config'
    );
  }

  async parseConfig(): Promise<SSHHost[]> {
    if (!fs.existsSync(this.configPath)) return [];

    const content = fs.readFileSync(this.configPath, 'utf-8');
    return this.parseContent(content);
  }

  private parseContent(content: string): SSHHost[] {
    const hosts: SSHHost[] = [];
    const lines = content.split('\n');
    let currentHost: SSHHost | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [directive, ...args] = trimmed.split(/\s+/);
      const value = args.join(' ');

      if (directive.toLowerCase() === 'host') {
        if (currentHost) hosts.push(currentHost);
        currentHost = {
          name: value,
          otherOptions: new Map()
        };
      } else if (currentHost) {
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

    if (currentHost) hosts.push(currentHost);
    return hosts;
  }

  async addHost(host: SSHHost): Promise<void> {
    const content = fs.existsSync(this.configPath) 
      ? fs.readFileSync(this.configPath, 'utf-8')
      : '';

    const entry = this.hostToConfig(host);
    const newContent = content + (content ? '\n' : '') + entry + '\n';
    await fs.promises.writeFile(this.configPath, newContent);
  }

  async updateHost(name: string, host: SSHHost): Promise<void> {
    const content = fs.readFileSync(this.configPath, 'utf-8');
    const lines = content.split('\n');
    const newLines: string[] = [];
    let inHost = false;
    let skip = false;

    for (const line of lines) {
      const trimmed = line.trim();
      const [directive, ...args] = trimmed.split(/\s+/);

      if (directive.toLowerCase() === 'host') {
        if (inHost && skip) skip = false;
        inHost = true;
        if (args[0] === name) {
          skip = true;
          newLines.push(this.hostToConfig(host));
          continue;
        }
      }

      if (!skip) newLines.push(line);
    }

    await fs.promises.writeFile(this.configPath, newLines.join('\n'));
  }

  async deleteHost(name: string): Promise<void> {
    const content = fs.readFileSync(this.configPath, 'utf-8');
    const lines = content.split('\n');
    const newLines: string[] = [];
    let inHost = false;
    let skip = false;

    for (const line of lines) {
      const trimmed = line.trim();
      const [directive, ...args] = trimmed.split(/\s+/);

      if (directive?.toLowerCase() === 'host') {
        if (inHost && skip) skip = false;
        inHost = true;
        if (args[0] === name) {
          skip = true;
          continue;
        }
      }

      if (!skip) newLines.push(line);
    }

    await fs.promises.writeFile(this.configPath, newLines.join('\n'));
  }

  private hostToConfig(host: SSHHost): string {
    const lines: string[] = [`Host ${host.name}`];
    if (host.hostName) lines.push(`  HostName ${host.hostName}`);
    if (host.user) lines.push(`  User ${host.user}`);
    if (host.port) lines.push(`  Port ${host.port}`);
    if (host.identityFile) lines.push(`  IdentityFile ${host.identityFile}`);
    host.otherOptions.forEach((value, key) => {
      lines.push(`  ${key} ${value}`);
    });
    return lines.join('\n');
  }
}
