import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db'
import { signUserToken, USER_COOKIE, cookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signUserToken({ userId: user.id })
    const res = NextResponse.json({ success: true, message: 'Login successful' })
    res.cookies.set(USER_COOKIE, token, cookieOptions(60 * 60 * 24))
    return res
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
