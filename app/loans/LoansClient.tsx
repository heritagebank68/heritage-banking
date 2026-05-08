'use client'
import { useState } from 'react'
import { Plus, X, BadgeDollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Loan } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  active:   'bg-green-100 text-green-700',
  paid:     'bg-gray-100 text-gray-600',
}

const STATUS_DESC: Record<string, string> = {
  pending:  'Your application is under review.',
  approved: 'Approved! Our team will contact you shortly.',
  rejected: 'Unfortunately your application was not approved.',
  active:   'Your loan is active. Please make timely payments.',
  paid:     'This loan has been fully repaid.',
}

const PURPOSES = ['Home Improvement', 'Education', 'Medical', 'Business', 'Vehicle', 'Debt Consolidation', 'Travel', 'Wedding', 'Other']

export default function LoansClient({ initialLoans, currency }: { initialLoans: Loan[]; currency: string }) {
  const [loans, setLoans]     = useState<Loan[]>(initialLoans)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount]   = useState('')
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [customPurpose, setCustomPurpose] = useState('')
  const [duration, setDuration] = useState('12')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const interestRate  = 0.08
  const monthlyRate   = interestRate / 12
  const num    = Number(amount)
  const dur    = Number(duration)
  const estimatedMonthly = num > 0 && dur > 0
    ? (num * monthlyRate * Math.pow(1 + monthlyRate, dur)) / (Math.pow(1 + monthlyRate, dur) - 1)
    : 0

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), purpose: purpose === 'Other' ? customPurpose : purpose, duration: Number(duration) }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setLoans(prev => [data.data, ...prev])
      setSuccess('Application submitted! We will review it shortly.')
      setShowForm(false)
      setAmount(''); setPurpose(PURPOSES[0]); setCustomPurpose(''); setDuration('12')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  const activeLoans = loans.filter(l => ['active', 'approved'].includes(l.status))
  const hasActiveOrPending = loans.some(l => ['active', 'pending'].includes(l.status))

  return (
    <div className="space-y-5">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>
      )}

      {/* Active loan summary */}
      {activeLoans.length > 0 && (
        <div className="rounded-xl bg-navy p-5 text-white space-y-3">
          <p className="text-xs text-white/60 uppercase tracking-widest">Active Loan</p>
          <p className="text-3xl font-bold">{formatCurrency(activeLoans[0].amount, currency)}</p>
          <div className="flex gap-6 text-sm">
            <div><p className="text-white/60 text-xs">Monthly Payment</p><p className="font-semibold">{formatCurrency(activeLoans[0].monthlyPayment, currency)}</p></div>
            <div><p className="text-white/60 text-xs">Duration</p><p className="font-semibold">{activeLoans[0].duration} months</p></div>
            <div><p className="text-white/60 text-xs">Purpose</p><p className="font-semibold">{activeLoans[0].purpose}</p></div>
          </div>
        </div>
      )}

      {/* Apply button */}
      {!hasActiveOrPending && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors">
          <Plus size={16} /> Apply for a Loan
        </button>
      )}

      {/* Application form */}
      {showForm && (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1A2E]">Loan Application</h2>
            <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"><X size={16} /></button>
          </div>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1A1A2E]">Loan Amount ({currency})</label>
              <input type="number" min="500" step="100" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} required
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1A1A2E]">Purpose</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {purpose === 'Other' && (
              <Input label="Describe purpose" placeholder="Enter loan purpose" value={customPurpose} onChange={e => setCustomPurpose(e.target.value)} required />
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1A1A2E]">Repayment Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {['6', '12', '24', '36', '48', '60'].map(d => (
                  <button key={d} type="button" onClick={() => setDuration(d)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${duration === d ? 'border-navy bg-navy text-white' : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy'}`}>
                    {d} mo
                  </button>
                ))}
              </div>
            </div>
            {estimatedMonthly > 0 && (
              <div className="rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 text-sm">
                <p className="text-[#6B7280]">Estimated monthly payment</p>
                <p className="text-lg font-bold text-navy mt-0.5">{formatCurrency(estimatedMonthly, currency)}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Based on 8% annual interest rate</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full py-3">Submit Application</Button>
          </form>
        </div>
      )}

      {/* Loans list */}
      {loans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#1A1A2E]">Loan History</h2>
          {loans.map(loan => (
            <div key={loan.id} className="rounded-xl bg-white border border-[#E5E7EB] p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{formatCurrency(loan.amount, currency)}</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">{loan.purpose}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[loan.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {loan.status}
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">{STATUS_DESC[loan.status] ?? ''}</p>
              {loan.adminNote && (
                <p className="text-xs text-[#6B7280] italic border-t border-[#F3F4F6] pt-2">Note: {loan.adminNote}</p>
              )}
              <div className="grid grid-cols-3 gap-2 border-t border-[#F3F4F6] pt-3">
                {[
                  { label: 'Duration', value: `${loan.duration} months` },
                  { label: 'Monthly', value: formatCurrency(loan.monthlyPayment, currency) },
                  { label: 'Applied', value: new Date(loan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#9CA3AF]">{label}</p>
                    <p className="text-xs font-semibold text-[#1A1A2E] mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {loans.length === 0 && !showForm && (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-16 flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <BadgeDollarSign size={24} className="text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-[#1A1A2E]">No loans yet</p>
          <p className="text-xs text-[#6B7280]">Apply for a loan to get started</p>
        </div>
      )}
    </div>
  )
}
