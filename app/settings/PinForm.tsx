'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { KeyRound } from 'lucide-react'

export default function PinForm({ hasPin }: { hasPin: boolean }) {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits.')
      return
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/pin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: hasPin ? currentPin : undefined, newPin }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setSuccess('PIN updated successfully.')
        setCurrentPin(''); setNewPin(''); setConfirmPin('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePinInput(val: string, setter: (v: string) => void) {
    if (/^\d{0,4}$/.test(val)) setter(val)
  }

  return (
    <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
        <KeyRound size={16} className="text-navy" />
        <div>
          <h2 className="font-semibold text-[#1A1A2E]">{hasPin ? 'Change Transaction PIN' : 'Set Transaction PIN'}</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Your 4-digit PIN is required to authorize transfers</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        {hasPin && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Current PIN</label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              maxLength={4}
              value={currentPin}
              onChange={e => handlePinInput(e.target.value, setCurrentPin)}
              required
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 tracking-[0.5em] text-center font-bold"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#1A1A2E]">New PIN</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            maxLength={4}
            value={newPin}
            onChange={e => handlePinInput(e.target.value, setNewPin)}
            required
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 tracking-[0.5em] text-center font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#1A1A2E]">Confirm New PIN</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            maxLength={4}
            value={confirmPin}
            onChange={e => handlePinInput(e.target.value, setConfirmPin)}
            required
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 tracking-[0.5em] text-center font-bold"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full py-3">
          {hasPin ? 'Update PIN' : 'Set PIN'}
        </Button>
      </form>
    </div>
  )
}
