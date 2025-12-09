import { randomBytes } from 'crypto';

export function generateSessionId(): string {
  return randomBytes(16).toString('hex');
}
