import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserLoans, createLoan, createNotification } from '@/lib/db'

async function getUserId(): Promise<string> {
  const cookieStore = cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) throw new Error('Unauthorized')
  const payload = await verifyUserToken(token)
  return payload.userId
}

export async function GET() {
  try {
    const userId = await getUserId()
    const loans = await getUserLoans(userId)
    return NextResponse.json({ success: true, data: loans })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    const { amount, purpose, duration } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 })
    }
    if (!purpose?.trim()) {
      return NextResponse.json({ success: false, message: 'Purpose is required' }, { status: 400 })
    }
    if (!duration || duration < 1 || duration > 60) {
      return NextResponse.json({ success: false, message: 'Duration must be 1-60 months' }, { status: 400 })
    }

    const interestRate = 0.08
    const monthlyRate = interestRate / 12
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
      (Math.pow(1 + monthlyRate, duration) - 1)

    const now = new Date().toISOString()
    const loan = {
      id: uuidv4(),
      userId,
      amount: Number(amount),
      purpose: purpose.trim(),
      duration: Number(duration),
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }

    await createLoan(loan)
    await createNotification({
      id: uuidv4(),
      userId,
      title: 'Loan Application Received',
      message: `Your loan application for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} has been submitted and is under review.`,
      type: 'info',
      read: false,
      createdAt: now,
    })

    return NextResponse.json({ success: true, data: loan }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
