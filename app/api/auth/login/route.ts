import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/app/lib/db';
import { signToken, sessionCookie } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return Response.json({ success: false, message: 'Vyplň email a heslo.' }, { status: 400 });

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT u.id, u.email, u.password_hash, p.username
       FROM auth.users u
       JOIN public.profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0)
      return Response.json({ success: false, message: 'Špatný email nebo heslo.' }, { status: 401 });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return Response.json({ success: false, message: 'Špatný email nebo heslo.' }, { status: 401 });

    const token = signToken({ userId: user.id, email: user.email, username: user.username });
    const res   = Response.json({ success: true, username: user.username });
    res.headers.set('Set-Cookie', cookieString(sessionCookie(token)));
    return res;
  } finally {
    client.release();
  }
}

function cookieString(c: ReturnType<typeof sessionCookie>) {
  return `${c.name}=${c.value}; HttpOnly; SameSite=${c.sameSite}; Path=${c.path}; Max-Age=${c.maxAge}`;
}
