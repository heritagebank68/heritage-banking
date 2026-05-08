'use client'
import { useEffect, useState } from 'react'
import { Landmark, Check, X, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface LoanRow {
  id: string
  userId: string
  memberName: string
  accountNumber: string
  preferredCurrency: string
  amount: number
  purpose: string
  duration: number
  monthlyPayment: number
  status: string
  adminNote?: string
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  active:   'bg-green-100 text-green-700',
  paid:     'bg-gray-100 text-gray-600',
}

export default function AdminLoansPage() {
  const [loans, setLoans]     = useState<LoanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/admin/loans').then(r => r.json())
      .then(d => { if (d.success) setLoans(d.data) })
      .finally(() => setLoading(false))
  }, [])

  function openAction(loan: LoanRow) {
    setActiveId(loan.id)
    setNewStatus(loan.status)
    setAdminNote(loan.adminNote ?? '')
    setError('')
  }

  async function submitAction(e: React.FormEvent, userId: string) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/loans/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote, userId }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setLoans(prev => prev.map(l => l.id === activeId ? { ...l, status: newStatus, adminNote } : l))
      setActiveId(null)
    } catch { setError('Something went wrong.') }
    finally { setSaving(false) }
  }

  const activeLoan = loans.find(l => l.id === activeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Landmark size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Loan Applications</h1>
            <p className="text-sm text-[#6B7280]">Review and manage member loan requests</p>
          </div>
        </div>
        {!loading && (
          <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
            {loans.length} loan{loans.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">Loading…</div>
        ) : loans.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No loan applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Member', 'Amount', 'Purpose', 'Duration', 'Monthly', 'Status', 'Applied', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#1A1A2E] whitespace-nowrap">{loan.memberName}</p>
                      <p className="text-xs text-[#9CA3AF] font-mono">{loan.accountNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#1A1A2E] whitespace-nowrap">{formatCurrency(loan.amount, loan.preferredCurrency)}</td>
                    <td className="px-4 py-3.5 text-[#6B7280] max-w-[160px] truncate">{loan.purpose}</td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">{loan.duration} mo</td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">{formatCurrency(loan.monthlyPayment, loan.preferredCurrency)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[loan.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap text-xs">
                      {new Date(loan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => openAction(loan)}
                        className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#6B7280] hover:border-navy hover:text-navy transition-colors whitespace-nowrap">
                        Update <ChevronDown size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action modal */}
      {activeId && activeLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Update Loan Status</h2>
              <button onClick={() => setActiveId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"><X size={16} /></button>
            </div>
            <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 space-y-1 text-sm">
              <p><span className="text-[#6B7280]">Member:</span> <span className="font-medium">{activeLoan.memberName}</span></p>
              <p><span className="text-[#6B7280]">Amount:</span> <span className="font-medium">{formatCurrency(activeLoan.amount, activeLoan.preferredCurrency)}</span></p>
              <p><span className="text-[#6B7280]">Purpose:</span> <span className="font-medium">{activeLoan.purpose}</span></p>
            </div>
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={e => submitAction(e, activeLoan.userId)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
                  {['pending', 'approved', 'rejected', 'active', 'paid'].map(s => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">Admin Note (Optional)</label>
                <textarea rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Reason or message for member…"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setActiveId(null)}
                  className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50 transition-colors">
                  <Check size={15} /> {saving ? 'Saving…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
