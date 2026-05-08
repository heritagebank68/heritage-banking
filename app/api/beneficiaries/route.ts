import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserBeneficiaries, createBeneficiary } from '@/lib/db'

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
    const beneficiaries = await getUserBeneficiaries(userId)
    return NextResponse.json({ success: true, data: beneficiaries })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    const { name, bank, accountNumber } = await req.json()

    if (!name?.trim() || !bank?.trim() || !accountNumber?.trim()) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    const beneficiary = {
      id: uuidv4(),
      userId,
      name: name.trim(),
      bank: bank.trim(),
      accountNumber: accountNumber.trim(),
      createdAt: new Date().toISOString(),
    }

    await createBeneficiary(beneficiary)
    return NextResponse.json({ success: true, data: beneficiary }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
