import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/app/lib/db';
import { signToken, sessionCookie } from '@/app/lib/auth';

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password)
    return Response.json({ success: false, message: 'Vyplň všechna pole.' }, { status: 400 });

  if (password.length < 6)
    return Response.json({ success: false, message: 'Heslo musí mít alespoň 6 znaků.' }, { status: 400 });

  const client = await pool.connect();
  try {
    // check duplicates
    const exists = await client.query(
      'SELECT id FROM auth.users WHERE email = $1', [email.toLowerCase()]
    );
    if (exists.rowCount && exists.rowCount > 0)
      return Response.json({ success: false, message: 'Email je již zaregistrovaný.' }, { status: 409 });

    const nameExists = await client.query(
      'SELECT user_id FROM public.profiles WHERE username = $1', [username]
    );
    if (nameExists.rowCount && nameExists.rowCount > 0)
      return Response.json({ success: false, message: 'Uživatelské jméno je obsazené.' }, { status: 409 });

    const id   = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO auth.users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, email.toLowerCase(), hash]
    );
    await client.query(
      `INSERT INTO public.profiles (user_id, username, display_name)
       VALUES ($1, $2, $3)`,
      [id, username, username]
    );
    await client.query('COMMIT');

    const token = signToken({ userId: id, email: email.toLowerCase(), username });
    const res   = Response.json({ success: true });
    res.headers.set('Set-Cookie', cookieString(sessionCookie(token)));
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('register error', err);
    return Response.json({ success: false, message: 'Chyba serveru.' }, { status: 500 });
  } finally {
    client.release();
  }
}

function cookieString(c: ReturnType<typeof sessionCookie>) {
  return `${c.name}=${c.value}; HttpOnly; SameSite=${c.sameSite}; Path=${c.path}; Max-Age=${c.maxAge}`;
}
