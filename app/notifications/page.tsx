import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance, getUserNotifications } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import NotificationsList from './NotificationsList'
import { Bell } from 'lucide-react'

export default async function NotificationsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) redirect('/auth')

  let userId: string
  try {
    const payload = await verifyUserToken(token)
    userId = payload.userId
  } catch { redirect('/auth') }

  const user = await getUserById(userId)
  if (!user) redirect('/auth')

  const [balance, notifications] = await Promise.all([
    getUserBalance(userId),
    getUserNotifications(userId),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 min-w-0 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Notifications</h1>
            <p className="text-sm text-[#6B7280]">Your account alerts and updates</p>
          </div>
        </div>
        <NotificationsList initialNotifications={notifications} />
      </main>
    </div>
  )
}
