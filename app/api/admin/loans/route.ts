import { NextRequest, NextResponse } from 'next/server'
import { getAllLoans, getAllUsers } from '@/lib/db'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyAdminToken(token)

    const [loans, users] = await Promise.all([getAllLoans(), getAllUsers()])
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    const data = loans.map(loan => ({
      ...loan,
      memberName: userMap[loan.userId]?.fullName ?? 'Unknown',
      accountNumber: userMap[loan.userId]?.accountNumber ?? '—',
      preferredCurrency: userMap[loan.userId]?.preferredCurrency ?? 'USD',
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
