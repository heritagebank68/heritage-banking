'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownLeft } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }

export default function DepositPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (!d.success) router.push('/auth')
      else setUser(d.data)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), description }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setSuccess('Deposit successful!')
        setAmount(''); setDescription('')
        setUser(prev => prev ? { ...prev, balance: data.data.balanceAfter } : prev)
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="ml-64 flex-1 p-8 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Deposit</h1>
            <p className="text-sm text-[#6B7280]">Add funds to your account</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-5 py-4">
          <span className="text-sm text-[#6B7280]">Available Balance</span>
          <span className="text-lg font-bold text-navy">
            {formatCurrency(user.balance, user.preferredCurrency)}
          </span>
        </div>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-[#1A1A2E]">Deposit Funds</h2>
            <p className="text-sm text-[#6B7280]">Enter the amount you want to deposit</p>
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#1A1A2E]">Amount</label>
              <input
                type="number" min="0.01" step="0.01" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} required
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
              />
            </div>
            <Input label="Description" placeholder="e.g. Paycheck" value={description} onChange={e => setDescription(e.target.value)} />
            <Button type="submit" className="w-full py-3" loading={loading}>Make Deposit</Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
