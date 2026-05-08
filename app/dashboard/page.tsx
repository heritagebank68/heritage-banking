import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance, getUserTransactions } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, Send, Receipt } from 'lucide-react'
import SpendingAnalytics from '@/components/SpendingAnalytics'
import BalanceCard from '@/components/BalanceCard'

export default async function DashboardPage() {
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

  const [balance, allTxs] = await Promise.all([
    getUserBalance(userId),
    getUserTransactions(userId),
  ])
  const userTxs = allTxs.slice(0, 5)
  const currency = user.preferredCurrency ?? 'USD'

  const firstName = user.fullName.split(' ')[0]

  const quickActions = [
    { href: '/deposit', label: 'Deposit', icon: ArrowDownLeft, color: 'text-green-600 bg-green-50' },
    { href: '/withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'text-orange-600 bg-orange-50' },
    { href: '/transfer', label: 'Transfer', icon: Send, color: 'text-blue-600 bg-blue-50' },
    { href: '/transactions', label: 'History', icon: Receipt, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Hi there, {firstName}!</h1>
          <p className="text-[#6B7280] mt-1">Here&apos;s what&apos;s happening with your account today.</p>
        </div>

        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          currency={currency}
          accountNumber={user.accountNumber}
          accountType={user.accountType}
        />

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {quickActions.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 hover:border-navy hover:shadow-sm transition-all"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium text-[#1A1A2E]">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Spending Analytics */}
        <SpendingAnalytics transactions={allTxs} currency={currency} />

        {/* Recent Transactions */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1A1A2E]">Recent Transactions</h2>
            <Link href="/transactions" className="text-sm text-navy hover:underline font-medium">View all →</Link>
          </div>
          {userTxs.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[#6B7280]">No transactions yet.</div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {userTxs.map(tx => (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{tx.description}</p>
                      <p className="text-xs text-[#6B7280]">{tx.category} • {new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.type === 'debit' ? -tx.amount : tx.amount, currency)}
                    </p>
                    <p className="text-xs text-[#6B7280]">Bal: {formatCurrency(tx.balanceAfter, currency)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
