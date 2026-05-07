import { getAllUsers, getUserBalance } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await getAllUsers()
  const members = await Promise.all(
    users.map(async ({ password: _pw, ...u }) => ({
      ...u,
      balance: await getUserBalance(u.id),
    }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Members</h1>
            <p className="text-sm text-[#6B7280]">All registered members</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        {members.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Full Name', 'Email', 'Account Number', 'Type', 'Currency', 'Balance', 'Joined'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{m.fullName}</td>
                    <td className="px-5 py-3.5 text-[#6B7280]">{m.email}</td>
                    <td className="px-5 py-3.5 font-mono text-[#6B7280]">{m.accountNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-medium text-navy">
                        {m.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280]">{m.preferredCurrency ?? 'USD'}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">
                      {formatCurrency(m.balance, m.preferredCurrency)}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280]">
                      {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
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
