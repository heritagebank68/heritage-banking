import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserById, updateUser, deleteUser, getUserTransactions, getUserBalance } from '@/lib/db'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!token) throw new Error('Unauthorized')
  await verifyAdminToken(token)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(req)
    const user = await getUserById(params.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    const [txs, balance] = await Promise.all([getUserTransactions(params.id), getUserBalance(params.id)])
    const { password: _p, pin: _pin, ...safeUser } = user
    return NextResponse.json({ success: true, data: { ...safeUser, balance, transactions: txs } })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(req)
    const body = await req.json()
    const { action, fullName, email, phone, accountType, preferredCurrency, newPassword } = body

    const user = await getUserById(params.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (action === 'reset-password') {
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
      }
      await updateUser(params.id, { password: await bcrypt.hash(newPassword, 10) })
      return NextResponse.json({ success: true, message: 'Password reset successfully' })
    }

    const updates: Record<string, string> = {}
    if (fullName)          updates.fullName = fullName
    if (email)             updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (accountType)       updates.accountType = accountType
    if (preferredCurrency) updates.preferredCurrency = preferredCurrency

    await updateUser(params.id, updates)
    return NextResponse.json({ success: true, message: 'Member updated successfully' })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(req)
    const user = await getUserById(params.id)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    await deleteUser(params.id)
    return NextResponse.json({ success: true, message: 'Member deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
