import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET ?? 'zemloveka-dev-secret-change-in-prod';
const COOKIE  = 'zl_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId:   string;
  email:    string;
  username: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar   = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function sessionCookie(token: string) {
  return {
    name:     COOKIE,
    value:    token,
    httpOnly: true,
    sameSite: 'lax'  as const,
    path:     '/',
    maxAge:   MAX_AGE,
  };
}

export function clearCookie() {
  return { name: COOKIE, value: '', maxAge: 0, path: '/' };
}
