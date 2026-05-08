import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance, getUserTransactions } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import ExportStatement from '@/components/ExportStatement'
import TransactionsList from './TransactionsList'
import { Receipt } from 'lucide-react'

export default async function TransactionsPage() {
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

  const [balance, userTxs] = await Promise.all([
    getUserBalance(userId),
    getUserTransactions(userId),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Receipt size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A2E]">Transactions</h1>
              <p className="text-sm text-[#6B7280]">View your transaction history</p>
            </div>
          </div>
          <ExportStatement
            transactions={userTxs}
            user={{ fullName: user.fullName, accountNumber: user.accountNumber, accountType: user.accountType, email: user.email }}
            balance={balance}
            currency={user.preferredCurrency ?? 'USD'}
          />
        </div>

        <TransactionsList transactions={userTxs} currency={user.preferredCurrency ?? 'USD'} />
      </main>
    </div>
  )
}
