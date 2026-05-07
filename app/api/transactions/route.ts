import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserTransactions } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const transactions = await getUserTransactions(userId)

    return NextResponse.json({ success: true, data: transactions })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
