'use client'
import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CURRENCIES } from '@/lib/utils'

export default function CreateUserPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [accountType, setAccountType] = useState<'Savings' | 'Checking'>('Savings')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, phone, accountType, preferredCurrency, pin: pin || undefined }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setSuccess(`Account created for ${data.data.fullName} (${data.data.accountNumber})`)
        setFullName(''); setEmail(''); setPassword(''); setPhone('')
        setAccountType('Savings'); setPreferredCurrency('USD'); setPin('')
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Create Member</h1>
          <p className="text-sm text-[#6B7280]">Add a new member account</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="Email" type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <Input label="Phone (Optional)" type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Account Type</label>
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value as 'Savings' | 'Checking')}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            >
              <option value="Savings">Savings</option>
              <option value="Checking">Checking</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Preferred Currency</label>
            <select
              value={preferredCurrency}
              onChange={e => setPreferredCurrency(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Transaction PIN (Optional)</label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPin(e.target.value) }}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 tracking-[0.5em] text-center font-bold"
            />
            <p className="text-xs text-[#9CA3AF]">Member can also set this themselves in Settings</p>
          </div>

          <Button type="submit" loading={loading} className="w-full py-3">Create Account</Button>
        </form>
      </Card>
    </div>
  )
}
