'use client'
import { useState, useEffect } from 'react'
import { Landmark } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface Member {
  id: string
  fullName: string
  accountNumber: string
  balance: number
  preferredCurrency?: string
}

export default function FundAccountPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [userId, setUserId] = useState('')
  const [type, setType] = useState<'credit' | 'debit'>('credit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.success) {
        setMembers(d.data)
        if (d.data.length > 0) setUserId(d.data[0].id)
      }
    })
  }, [])

  const selectedMember = members.find(m => m.id === userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, amount: Number(amount), description }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        const newBal = formatCurrency(data.data.balanceAfter, selectedMember?.preferredCurrency)
        setSuccess(`${type === 'credit' ? 'Credit' : 'Debit'} applied. New balance: ${newBal}`)
        setAmount(''); setDescription('')
        setMembers(prev => prev.map(m =>
          m.id === userId ? { ...m, balance: data.data.balanceAfter } : m
        ))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <Landmark size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Fund Account</h1>
          <p className="text-sm text-[#6B7280]">Credit or debit a member&apos;s account</p>
        </div>
      </div>

      {selectedMember && (
        <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-5 py-4">
          <span className="text-sm text-[#6B7280]">Current Balance</span>
          <span className="text-lg font-bold text-navy">
            {formatCurrency(selectedMember.balance, selectedMember.preferredCurrency)}
          </span>
        </div>
      )}

      <Card className="p-6 space-y-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Member</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
              required
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName} — {m.accountNumber}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Transaction Type</label>
            <div className="flex gap-2">
              {(['credit', 'debit'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors capitalize ${
                    type === t
                      ? t === 'credit'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy hover:text-navy'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. Monthly bonus"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <Button type="submit" loading={loading} className="w-full py-3">
            Apply {type === 'credit' ? 'Credit' : 'Debit'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
