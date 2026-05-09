'use client'
import {
  Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface Props {
  transactions: Transaction[]
  currency: string
}

const CATEGORY_COLORS: Record<string, string> = {
  'Deposit':      '#22c55e',
  'Admin Credit': '#3b82f6',
  'Transfer':     '#8b5cf6',
  'Withdrawal':   '#f97316',
  'Admin Debit':  '#ef4444',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getLast6Months() {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()] }
  })
}

export default function SpendingAnalytics({ transactions, currency }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-[#E5E7EB] px-6 py-12 text-center">
        <Activity size={32} className="mx-auto text-[#D1D5DB] mb-3" />
        <p className="text-sm text-[#6B7280]">No transaction data yet to analyse.</p>
      </div>
    )
  }

  // ── Stats ──
  const totalIn  = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)
  const net      = totalIn - totalOut

  // ── Donut: by category ──
  const categoryMap: Record<string, number> = {}
  transactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount
  })
  const donutData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // ── Bar: last 6 months ──
  const months = getLast6Months()
  const barData = months.map(({ key, label }) => {
    const [yr, mo] = key.split('-').map(Number)
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.createdAt)
      return d.getFullYear() === yr && d.getMonth() === mo
    })
    return {
      month: label,
      In:  monthTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
      Out: monthTxs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
    }
  })

  const stats = [
    { label: 'Total Money In',  value: totalIn,  icon: TrendingUp,   color: 'text-green-600 bg-green-50' },
    { label: 'Total Money Out', value: totalOut, icon: TrendingDown,  color: 'text-red-500 bg-red-50' },
    { label: 'Net Flow',        value: net,       icon: Activity,     color: net >= 0 ? 'text-blue-600 bg-blue-50' : 'text-orange-500 bg-orange-50' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-[#1A1A2E]">Spending Analytics</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white border border-[#E5E7EB] px-5 py-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#6B7280]">{label}</p>
              <p className={`text-base font-bold truncate ${value < 0 ? 'text-red-500' : 'text-[#1A1A2E]'}`}>
                {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value), currency)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut — category breakdown */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-5">
          <p className="text-sm font-semibold text-[#1A1A2E] mb-4">By Category</p>
          {(() => {
            const size = 160, r = 60, sw = 30
            const circ = 2 * Math.PI * r
            const total = donutData.reduce((s, d) => s + d.value, 0)
            if (total === 0) return null
            let acc = 0
            return (
              <svg width="100%" height={size} viewBox="0 0 160 160" style={{ display: 'block' }}>
                {donutData.map((entry, i) => {
                  const arc = (entry.value / total) * circ
                  const offset = circ / 4 - acc
                  acc += arc
                  const isFull = arc >= circ - 0.01
                  return (
                    <circle
                      key={entry.name}
                      cx={80} cy={80} r={r}
                      fill="none"
                      stroke={CATEGORY_COLORS[entry.name] ?? `hsl(${i * 60},65%,55%)`}
                      strokeWidth={sw}
                      {...(isFull ? {} : {
                        strokeDasharray: `${arc} ${circ - arc}`,
                        strokeDashoffset: offset,
                      })}
                    />
                  )
                })}
              </svg>
            )
          })()}
          {/* Legend */}
          <div className="mt-3 space-y-1.5">
            {donutData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? `hsl(${i * 60}, 65%, 55%)` }}
                  />
                  <span className="text-[#6B7280]">{entry.name}</span>
                </div>
                <span className="font-medium text-[#1A1A2E]">{formatCurrency(entry.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar — monthly in vs out */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-5">
          <p className="text-sm font-semibold text-[#1A1A2E] mb-4">Last 6 Months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={14} barGap={4} accessibilityLayer={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                width={36}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                formatter={(val) => formatCurrency(Number(val ?? 0), currency)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', backgroundColor: '#fff' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Bar dataKey="In"  fill="#22c55e" radius={[4, 4, 0, 0]} name="Money In" />
              <Bar dataKey="Out" fill="#ef4444" radius={[4, 4, 0, 0]} name="Money Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
