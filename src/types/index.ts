export interface SSHKey {
  path: string;
  type: 'rsa' | 'ed25519' | 'ecdsa' | 'dsa';
  publicKey?: string;
  comment?: string;
  fingerprint?: string;
  hasPassphrase: boolean;
  permissions?: string;
}

export interface SSHHost {
  name: string;
  hostName?: string;
  user?: string;
  port?: number;
  identityFile?: string;
  otherOptions: Map<string, string>;
}

export interface KnownHostEntry {
  host: string;
  keyType: string;
  hashed: boolean;
  lineNumber: number;
}

export interface SSHAgentStatus {
  running: boolean;
  identities?: SSHAgentIdentity[];
}

export interface SSHAgentIdentity {
  comment: string;
  type: string;
  fingerprint?: string;
}
