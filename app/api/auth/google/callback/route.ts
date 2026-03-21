import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang  = searchParams.get('state') ?? 'cs'
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? 'http://localhost:3003'

  return NextResponse.redirect(`${appUrl}/${lang}/login?error=oauth_disabled`)
}
