import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, updateUserPin } from '@/lib/db'

// PATCH — set or change PIN
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const { currentPin, newPin } = await req.json()

    if (!newPin || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ success: false, message: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    const user = await getUserById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (user.pin) {
      if (!currentPin) return NextResponse.json({ success: false, message: 'Current PIN is required' }, { status: 400 })
      if (!(await bcrypt.compare(currentPin, user.pin))) {
        return NextResponse.json({ success: false, message: 'Current PIN is incorrect' }, { status: 400 })
      }
    }

    await updateUserPin(userId, await bcrypt.hash(newPin, 10))
    return NextResponse.json({ success: true, message: 'PIN updated successfully' })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// POST — verify PIN during transfer
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const { pin } = await req.json()

    const user = await getUserById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (!user.pin) {
      return NextResponse.json({ success: false, message: 'No PIN set. Please set a PIN in Settings first.' }, { status: 400 })
    }

    if (!(await bcrypt.compare(pin, user.pin))) {
      return NextResponse.json({ success: false, message: 'Incorrect PIN' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
