'use client'
import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    acc[date] = acc[date] ? [...acc[date], tx] : [tx]
    return acc
  }, {} as Record<string, Transaction[]>)
}

export default function TransactionsList({ transactions, currency }: { transactions: Transaction[]; currency: string }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (dateFrom && new Date(tx.createdAt) < new Date(dateFrom)) return false
      if (dateTo && new Date(tx.createdAt) > new Date(dateTo + 'T23:59:59')) return false
      if (search) {
        const q = search.toLowerCase()
        return tx.description.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q)
      }
      return true
    })
  }, [transactions, search, typeFilter, dateFrom, dateTo])

  const grouped = groupByDate(filtered)

  return (
    <div className="space-y-4">
      {/* Search & filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${showFilters ? 'border-navy bg-navy text-white' : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-navy hover:text-navy'}`}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex gap-2">
              {(['all', 'credit', 'debit'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    typeFilter === t
                      ? t === 'credit' ? 'border-green-500 bg-green-50 text-green-700'
                      : t === 'debit' ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-navy bg-navy text-white'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-[#6B7280] text-xs">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-xs outline-none focus:border-navy" />
              <label className="text-[#6B7280] text-xs">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-xs outline-none focus:border-navy" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo('') }}
                  className="text-xs text-red-500 hover:underline">Clear</button>
              )}
            </div>
          </div>
        )}

        {filtered.length !== transactions.length && (
          <p className="text-xs text-[#6B7280]">Showing {filtered.length} of {transactions.length} transactions</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-16 text-center text-[#6B7280] text-sm">
          No transactions match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{date}</p>
              <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB]">
                {txs.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A2E]">{tx.description}</p>
                        <p className="text-xs text-[#6B7280]">
                          {tx.category} • {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.type === 'debit' ? -tx.amount : tx.amount, currency)}
                      </p>
                      <p className="text-xs text-[#6B7280]">Bal: {formatCurrency(tx.balanceAfter, currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
