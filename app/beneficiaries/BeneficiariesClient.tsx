'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Send, X, BookUser } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Beneficiary } from '@/lib/types'

export default function BeneficiariesClient({ initialBeneficiaries }: { initialBeneficiaries: Beneficiary[] }) {
  const [list, setList]       = useState<Beneficiary[]>(initialBeneficiaries)
  const [showForm, setShowForm] = useState(false)
  const [name, setName]       = useState('')
  const [bank, setBank]       = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bank, accountNumber }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setList(prev => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)))
      setShowForm(false); setName(''); setBank(''); setAccountNumber('')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' })
    setList(prev => prev.filter(b => b.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(s => !s)}
        className="flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors">
        <Plus size={16} /> Add Beneficiary
      </button>

      {showForm && (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1A2E]">New Beneficiary</h2>
            <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"><X size={16} /></button>
          </div>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Full Name" placeholder="Recipient's name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Bank Name" placeholder="e.g. Chase Bank" value={bank} onChange={e => setBank(e.target.value)} required />
            <Input label="Account Number" placeholder="Account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full py-3">Save Beneficiary</Button>
          </form>
        </div>
      )}

      {list.length === 0 && !showForm ? (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-16 flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <BookUser size={24} className="text-teal-500" />
          </div>
          <p className="text-sm font-medium text-[#1A1A2E]">No saved beneficiaries</p>
          <p className="text-xs text-[#6B7280]">Add recipients you frequently send money to</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB]">
          {list.map(b => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex-shrink-0">
                  {b.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{b.name}</p>
                  <p className="text-xs text-[#6B7280]">{b.bank} • <span className="font-mono">{b.accountNumber}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/transfer?name=${encodeURIComponent(b.name)}&bank=${encodeURIComponent(b.bank)}&account=${encodeURIComponent(b.accountNumber)}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Send money">
                  <Send size={14} />
                </Link>
                <button onClick={() => setDeleteId(b.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors" title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Remove Beneficiary?</h2>
              <p className="text-sm text-[#6B7280] mt-1">This will remove them from your saved recipients.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId!)}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
