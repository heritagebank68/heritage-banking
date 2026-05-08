'use client'
import { useEffect, useState, useMemo } from 'react'
import { Receipt, Pencil, Check, X, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TxRow {
  id: string
  userId: string
  memberName: string
  accountNumber: string
  type: 'credit' | 'debit'
  category: string
  amount: number
  description: string
  balanceAfter: number
  preferredCurrency?: string
  createdAt: string
}

export default function AdminTransactionsPage() {
  const [rows, setRows]       = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then(r => r.json())
      .then(d => { if (d.success) setRows(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return rows.filter(tx => {
      const matchType   = typeFilter === 'all' || tx.type === typeFilter
      const q = search.toLowerCase()
      const matchSearch = !q ||
        tx.memberName.toLowerCase().includes(q) ||
        tx.accountNumber.includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      return matchType && matchSearch
    })
  }, [rows, search, typeFilter])

  function startEdit(tx: TxRow) {
    setEditingId(tx.id)
    const d = new Date(tx.createdAt)
    setEditDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
    setError('')
  }

  async function saveDate(id: string) {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: editDate }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setRows(prev => prev.map(r => r.id === id ? { ...r, createdAt: new Date(editDate).toISOString() } : r))
      setEditingId(null)
    } catch { setError('Something went wrong.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Receipt size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">All Transactions</h1>
            <p className="text-sm text-[#6B7280]">View and adjust transaction dates</p>
          </div>
        </div>
        {rows.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
            {filtered.length} / {rows.length}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search member, description, category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'credit', 'debit'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                typeFilter === t
                  ? t === 'credit' ? 'border-green-500 bg-green-50 text-green-700'
                  : t === 'debit' ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-navy bg-navy text-white'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy hover:text-navy'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Member', 'Description', 'Type', 'Amount', 'Balance After', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#1A1A2E] whitespace-nowrap">{tx.memberName}</p>
                      <p className="text-xs text-[#9CA3AF] font-mono">{tx.accountNumber}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#1A1A2E]">{tx.description || '—'}</p>
                      <p className="text-xs text-[#9CA3AF]">{tx.category}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 font-semibold whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, tx.preferredCurrency)}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">{formatCurrency(tx.balanceAfter, tx.preferredCurrency)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {editingId === tx.id ? (
                        <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)}
                          className="rounded-lg border border-navy px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-navy/20" />
                      ) : (
                        <span className="text-[#6B7280] text-xs">
                          {new Date(tx.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {editingId === tx.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => saveDate(tx.id)} disabled={saving}
                            className="flex items-center justify-center h-7 w-7 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center justify-center h-7 w-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(tx)}
                          className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                          <Pencil size={12} /> Edit Date
                        </button>
                      )}
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
