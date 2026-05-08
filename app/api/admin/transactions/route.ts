import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'
import { getAllTransactions, getAllUsers } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyAdminToken(token)

    const [txs, users] = await Promise.all([getAllTransactions(), getAllUsers()])
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    const data = txs.map(tx => {
      const user = userMap[tx.userId]
      return {
        id: tx.id,
        userId: tx.userId,
        memberName: user?.fullName ?? 'Unknown',
        accountNumber: user?.accountNumber ?? '—',
        preferredCurrency: user?.preferredCurrency ?? 'USD',
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        description: tx.description,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
