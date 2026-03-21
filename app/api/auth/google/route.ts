import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'OAuth support is disabled for this project.' },
    { status: 404 }
  )
}
