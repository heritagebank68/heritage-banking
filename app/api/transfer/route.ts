import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserBalance, createTransaction } from '@/lib/db'
import type { Transaction } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const { bank, accountNumber, amount, narration } = await req.json()

    if (!bank || !accountNumber || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Bank, account number and amount are required' },
        { status: 400 }
      )
    }

    const numAmount = Number(amount)
    const balanceBefore = await getUserBalance(userId)

    if (balanceBefore < numAmount) {
      return NextResponse.json({ success: false, message: 'Insufficient funds' }, { status: 400 })
    }

    const transaction: Transaction = {
      id: uuidv4(),
      userId,
      type: 'debit',
      category: 'Transfer',
      amount: numAmount,
      description: narration || `Transfer to ${bank} — ${accountNumber}`,
      balanceBefore,
      balanceAfter: balanceBefore - numAmount,
      createdAt: new Date().toISOString(),
    }

    await createTransaction(transaction)

    return NextResponse.json({ success: true, data: transaction })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
