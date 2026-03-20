import { clearCookie } from '@/app/lib/auth';

export async function POST() {
  const c   = clearCookie();
  const res = Response.json({ success: true });
  res.headers.set('Set-Cookie', `${c.name}=${c.value}; HttpOnly; Path=${c.path}; Max-Age=0`);
  return res;
}
