import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserById, getUserBalance, getUserTransactions } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, User, Receipt } from 'lucide-react'

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id)
  if (!user) notFound()

  const [balance, txs] = await Promise.all([
    getUserBalance(params.id),
    getUserTransactions(params.id),
  ])

  const totalIn  = txs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalOut = txs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const currency = user.preferredCurrency ?? 'USD'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard"
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
          <ArrowLeft size={15} /> Back to Members
        </Link>
      </div>

      {/* Profile card */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white font-bold text-lg">
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#1A1A2E]">{user.fullName}</p>
            <p className="text-sm text-[#6B7280]">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[#6B7280]">Current Balance</p>
            <p className="text-xl font-bold text-navy">{formatCurrency(balance, currency)}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E5E7EB]">
          {[
            { label: 'Account Number', value: user.accountNumber },
            { label: 'Account Type',   value: user.accountType },
            { label: 'Currency',        value: currency },
            { label: 'Joined',          value: new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4">
              <dt className="text-xs text-[#6B7280]">{label}</dt>
              <dd className="text-sm font-semibold text-[#1A1A2E] mt-0.5 font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Transactions', value: String(txs.length),            color: 'text-navy bg-navy/10' },
          { label: 'Total In',     value: formatCurrency(totalIn, currency),  color: 'text-green-600 bg-green-50' },
          { label: 'Total Out',    value: formatCurrency(totalOut, currency), color: 'text-red-500 bg-red-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white border border-[#E5E7EB] px-5 py-4 text-center">
            <p className={`text-base font-bold ${color.split(' ')[0]}`}>{value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <Receipt size={16} className="text-[#6B7280]" />
          <span className="text-sm font-semibold text-[#1A1A2E]">Transaction History</span>
          <span className="ml-auto inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">{txs.length}</span>
        </div>
        {txs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E5E7EB]">
                <tr>
                  {['Date', 'Description', 'Category', 'Type', 'Amount', 'Balance After'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {txs.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap text-xs">
                      {new Date(tx.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 text-[#1A1A2E]">{tx.description || '—'}</td>
                    <td className="px-4 py-3.5 text-[#6B7280]">{tx.category}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 font-semibold whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">{formatCurrency(tx.balanceAfter, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
