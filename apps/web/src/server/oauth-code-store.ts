export interface PendingAuthCode {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  resource: string | null;
  state: string | null;
  expiresAt: number;
}

const pending = new Map<string, PendingAuthCode>();

export function saveAuthCode(code: string, record: PendingAuthCode) {
  pending.set(code, record);
}

export function consumeAuthCode(code: string) {
  const record = pending.get(code);
  if (!record) return null;
  pending.delete(code);
  if (record.expiresAt < Date.now()) return null;
  return record;
}
