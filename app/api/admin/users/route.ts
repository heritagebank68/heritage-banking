import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getAllUsers, getUserByEmail, createUser, getUserBalance } from '@/lib/db'

function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

export async function GET() {
  const users = await getAllUsers()
  const result = await Promise.all(
    users.map(async ({ password: _p, ...u }) => ({
      ...u,
      balance: await getUserBalance(u.id),
    }))
  )
  return NextResponse.json({ success: true, data: result })
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phone, accountType, preferredCurrency } = await req.json()

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, email and password are required' },
        { status: 400 }
      )
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 })
    }

    const newUser = {
      id: uuidv4(),
      fullName,
      email,
      password: await bcrypt.hash(password, 10),
      phone: phone || '',
      accountNumber: generateAccountNumber(),
      accountType: (accountType as 'Savings' | 'Checking') || 'Savings',
      preferredCurrency: preferredCurrency || 'USD',
      createdAt: new Date().toISOString(),
    }

    await createUser(newUser)

    const { password: _p, ...safeUser } = newUser
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
