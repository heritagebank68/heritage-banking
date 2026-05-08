import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance, getUserLoans } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import LoansClient from './LoansClient'
import { BadgeDollarSign } from 'lucide-react'

export default async function LoansPage() {
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

  const [balance, loans] = await Promise.all([
    getUserBalance(userId),
    getUserLoans(userId),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 min-w-0 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <BadgeDollarSign size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Loans</h1>
            <p className="text-sm text-[#6B7280]">Apply for and manage your loans</p>
          </div>
        </div>
        <LoansClient initialLoans={loans} currency={user.preferredCurrency ?? 'USD'} />
      </main>
    </div>
  )
}
