import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, updateUserPassword } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { userId } = await verifyUserToken(token)
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const user = await getUserById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    await updateUserPassword(userId, await bcrypt.hash(newPassword, 10))

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
