import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, ADMIN_COOKIE, cookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signAdminToken()
    const res = NextResponse.json({ success: true })
    res.cookies.set(ADMIN_COOKIE, token, cookieOptions(60 * 60 * 8))
    return res
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
