import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserNotifications, markAllNotificationsRead, getUnreadCount } from '@/lib/db'

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
    const [notifications, unread] = await Promise.all([
      getUserNotifications(userId),
      getUnreadCount(userId),
    ])
    return NextResponse.json({ success: true, data: notifications, unread })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId()
    const { action } = await req.json()
    if (action === 'mark-all-read') {
      await markAllNotificationsRead(userId)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
}
