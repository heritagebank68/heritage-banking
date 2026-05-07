import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUserById, getUserBalance, getUserTransactions } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import { Receipt } from 'lucide-react'
import type { Transaction } from '@/lib/types'

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    acc[date] = acc[date] ? [...acc[date], tx] : [tx]
    return acc
  }, {} as Record<string, Transaction[]>)
}

export default async function TransactionsPage() {
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

  const [balance, userTxs] = await Promise.all([
    getUserBalance(userId),
    getUserTransactions(userId),
  ])

  const grouped = groupByDate(userTxs)

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Receipt size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Transactions</h1>
            <p className="text-sm text-[#6B7280]">View your transaction history</p>
          </div>
        </div>

        {userTxs.length === 0 ? (
          <div className="rounded-xl bg-white border border-[#E5E7EB] p-16 text-center text-[#6B7280]">
            No transactions yet.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{date}</p>
                <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB]">
                  {txs.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A2E]">{tx.description}</p>
                          <p className="text-xs text-[#6B7280]">
                            {tx.category} • {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.type === 'debit' ? -tx.amount : tx.amount, user.preferredCurrency)}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Bal: {formatCurrency(tx.balanceAfter, user.preferredCurrency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
