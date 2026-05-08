import { getAllUsers, getUserBalance, getAllTransactions } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import AdminMembersList from './AdminMembersList'
import { Users, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default async function AdminDashboardPage() {
  const users = await getAllUsers()
  const txs = await getAllTransactions()

  const membersWithBalance = await Promise.all(
    users.map(async ({ password: _pw, pin: _pin, ...u }) => ({
      ...u,
      balance: await getUserBalance(u.id),
    }))
  )

  const totalBalance  = membersWithBalance.reduce((s, m) => s + m.balance, 0)
  const totalCredits  = txs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits   = txs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const stats = [
    { label: 'Total Members',      value: String(users.length),          icon: Users,         color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Balance',       value: formatCurrency(totalBalance),  icon: DollarSign,    color: 'bg-navy/10 text-navy' },
    { label: 'Total Credited',      value: formatCurrency(totalCredits),  icon: ArrowDownLeft, color: 'bg-green-50 text-green-600' },
    { label: 'Total Debited',       value: formatCurrency(totalDebits),   icon: ArrowUpRight,  color: 'bg-red-50 text-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A2E]">Members</h1>
        <p className="text-sm text-[#6B7280]">Overview and member management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white border border-[#E5E7EB] px-5 py-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#6B7280]">{label}</p>
              <p className="text-base font-bold text-[#1A1A2E] truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <AdminMembersList initialMembers={membersWithBalance} />
    </div>
  )
}
