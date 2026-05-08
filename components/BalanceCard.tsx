'use client'
import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  balance: number
  currency: string
  accountNumber: string
  accountType: string
}

export default function BalanceCard({ balance, currency, accountNumber, accountType }: BalanceCardProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyAccountNumber() {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-navy p-6 text-white">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/70">Total Balance</p>
        <button
          onClick={() => setVisible(v => !v)}
          className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
          aria-label={visible ? 'Hide balance' : 'Show balance'}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      <p className="text-4xl font-bold mb-4 tracking-tight">
        {visible ? formatCurrency(balance, currency) : '••••••'}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Account Number</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm">{accountNumber}</span>
            <button onClick={copyAccountNumber} aria-label="Copy account number">
              {copied
                ? <Check size={13} className="text-green-400" />
                : <Copy size={13} className="text-white/50 hover:text-white" />
              }
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Account Type</p>
          <span className="inline-block mt-0.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
            {accountType}
          </span>
        </div>
      </div>
    </div>
  )
}
