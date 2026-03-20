import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import pool from '@/app/lib/db'
import { signToken, sessionCookie } from '@/app/lib/auth'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  error?: string
}

interface GoogleUser {
  sub:     string
  email:   string
  name:    string
  picture: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const lang  = searchParams.get('state') ?? 'cs'
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? 'http://localhost:3003'

  if (!code) {
    return NextResponse.redirect(`${appUrl}/${lang}/login?error=google_cancelled`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  `${appUrl}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    })
    const tokens: GoogleTokenResponse = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error)

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser: GoogleUser = await userRes.json()

    // Upsert user in DB
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Check if a user with this google_id already exists
      let { rows } = await client.query<{ id: string; email: string; username: string }>(
        `SELECT u.id, u.email, p.username FROM auth.users u JOIN public.profiles p ON p.user_id = u.id WHERE u.google_id = $1`,
        [googleUser.sub]
      )

      if (rows.length === 0) {
        // Check if email is already registered (link accounts)
        const existing = await client.query<{ id: string; email: string; username: string }>(
          `SELECT u.id, u.email, p.username FROM auth.users u JOIN public.profiles p ON p.user_id = u.id WHERE u.email = $1`,
          [googleUser.email]
        )

        if (existing.rows.length > 0) {
          // Link Google to existing account
          await client.query(
            `UPDATE auth.users SET google_id = $1 WHERE id = $2`,
            [googleUser.sub, existing.rows[0].id]
          )
          rows = existing.rows
        } else {
          // Create new user
          const userId      = uuidv4()
          const username    = `user_${userId.replace(/-/g, '').slice(0, 10)}`
          const displayName = googleUser.name || username

          await client.query(
            `INSERT INTO auth.users (id, email, google_id) VALUES ($1, $2, $3)`,
            [userId, googleUser.email, googleUser.sub]
          )
          await client.query(
            `INSERT INTO public.profiles (user_id, username, display_name, avatar_url)
             VALUES ($1, $2, $3, $4)`,
            [userId, username, displayName, googleUser.picture || null]
          )
          rows = [{ id: userId, email: googleUser.email, username }]
        }
      }

      await client.query('COMMIT')

      const cookie = sessionCookie(signToken({ userId: rows[0].id, email: rows[0].email, username: rows[0].username }))
      const cookieStr = `${cookie.name}=${cookie.value}; HttpOnly; SameSite=${cookie.sameSite}; Path=${cookie.path}; Max-Age=${cookie.maxAge}`
      const response = NextResponse.redirect(`${appUrl}/${lang}`)
      response.headers.set('Set-Cookie', cookieStr)
      return response
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Google OAuth error:', err)
    return NextResponse.redirect(`${appUrl}/${lang}/login?error=google_failed`)
  }
}
