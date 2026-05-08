import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import PasswordForm from './PasswordForm'
import PinForm from './PinForm'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) redirect('/auth')

  let userId: string
  try {
    const payload = await verifyUserToken(token)
    userId = payload.userId
  } catch {
    redirect('/auth')
  }

  const user = await getUserById(userId)
  if (!user) redirect('/auth')

  const balance = await getUserBalance(userId)

  const fields = [
    { label: 'Full Name', value: user.fullName },
    { label: 'Email Address', value: user.email },
    { label: 'Phone', value: user.phone || '—' },
    { label: 'Account Number', value: user.accountNumber },
    { label: 'Account Type', value: user.accountType },
    { label: 'Preferred Currency', value: user.preferredCurrency ?? 'USD' },
    { label: 'Current Balance', value: formatCurrency(balance, user.preferredCurrency) },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 max-w-2xl min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Settings</h1>
            <p className="text-sm text-[#6B7280]">Manage your account preferences</p>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1A1A2E]">Profile Information</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Contact your branch to update profile information</p>
          </div>
          <dl className="divide-y divide-[#E5E7EB]">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-3.5">
                <dt className="text-sm text-[#6B7280]">{label}</dt>
                <dd className="text-sm font-medium text-[#1A1A2E]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Password */}
        <PasswordForm />

        {/* Transaction PIN */}
        <PinForm hasPin={!!user.pin} />
      </main>
    </div>
  )
}
