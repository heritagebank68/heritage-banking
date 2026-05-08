import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { markNotificationRead } from '@/lib/db'

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(USER_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyUserToken(token)
    await markNotificationRead(params.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
