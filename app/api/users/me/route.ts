import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const user = await getUserById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const { password: _p, pin: _pin, ...safeUser } = user
    const balance = await getUserBalance(userId)

    return NextResponse.json({ success: true, data: { ...safeUser, balance } })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
