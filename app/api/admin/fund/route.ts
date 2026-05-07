import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getUserById, getUserBalance, createTransaction } from '@/lib/db'
import type { Transaction } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { userId, type, amount, description } = await req.json()

    if (!userId || !type || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: 'userId, type, and a positive amount are required' },
        { status: 400 }
      )
    }

    if (!['credit', 'debit'].includes(type)) {
      return NextResponse.json({ success: false, message: 'type must be credit or debit' }, { status: 400 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const balanceBefore = await getUserBalance(userId)
    const numAmount = Number(amount)

    if (type === 'debit' && balanceBefore < numAmount) {
      return NextResponse.json({ success: false, message: 'Insufficient funds for this debit' }, { status: 400 })
    }

    const balanceAfter = type === 'credit' ? balanceBefore + numAmount : balanceBefore - numAmount

    const transaction: Transaction = {
      id: uuidv4(),
      userId,
      type,
      category: type === 'credit' ? 'Admin Credit' : 'Admin Debit',
      amount: numAmount,
      description: description || (type === 'credit' ? 'Admin Credit' : 'Admin Debit'),
      balanceBefore,
      balanceAfter,
      createdAt: new Date().toISOString(),
    }

    await createTransaction(transaction)

    return NextResponse.json({ success: true, data: transaction })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
