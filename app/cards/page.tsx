'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CreditCard, Wifi, ShieldCheck, Copy, Check } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'

interface UserData {
  fullName: string
  accountNumber: string
  balance: number
  preferredCurrency?: string
  createdAt?: string
}

function generateCardDetails(accountNumber: string, createdAt: string) {
  const d = accountNumber.replace(/\D/g, '')
  // Visa card: starts with 4532
  const cardNumber = '4532' + d.slice(0, 4) + d.slice(4, 8) + d.slice(0, 4)

  // Expiry: 4 years from account creation
  const created = new Date(createdAt || Date.now())
  const expiry = new Date(created)
  expiry.setFullYear(expiry.getFullYear() + 4)
  const mm = String(expiry.getMonth() + 1).padStart(2, '0')
  const yy = String(expiry.getFullYear()).slice(-2)

  // CVV: 3 digits from middle of account number
  const cvv = d.slice(3, 6)

  return {
    cardNumber,
    expiry: `${mm}/${yy}`,
    cvv,
  }
}

function formatCardNumber(num: string) {
  return num.replace(/(.{4})/g, '$1 ').trim()
}

function maskCardNumber(num: string) {
  return `•••• •••• •••• ${num.slice(-4)}`
}

export default function CardsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [showNumber, setShowNumber] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [copied, setCopied] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (!d.success) router.push('/auth')
      else setUser(d.data)
    })
  }, [router])

  if (!user) return null

  const currency = user.preferredCurrency ?? 'USD'
  const card = generateCardDetails(user.accountNumber, user.createdAt ?? new Date().toISOString())

  function copyCardNumber() {
    navigator.clipboard.writeText(card.cardNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar user={user} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 max-w-2xl min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">My Card</h1>
            <p className="text-sm text-[#6B7280]">Your Heritage debit card</p>
          </div>
        </div>

        {/* Card visual */}
        <div
          className="relative cursor-pointer select-none"
          style={{ perspective: '1000px' }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            className="relative w-full transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '200px',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #001F45 0%, #002D62 50%, #003F8A 100%)',
              }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full border-[40px] border-white" />
                <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full border-[40px] border-white" />
              </div>

              {/* Top row */}
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Heritage</p>
                  <p className="text-sm font-bold text-white">Community Credit Union</p>
                </div>
                {/* Contactless icon */}
                <Wifi size={22} className="text-white/70 rotate-90" />
              </div>

              {/* Chip + card number */}
              <div className="relative space-y-4">
                {/* Chip */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                    <div className="h-5 w-7 rounded-sm border-2 border-yellow-600/40 grid grid-cols-3 grid-rows-3 gap-px p-px">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-yellow-600/30 rounded-[1px]" />
                      ))}
                    </div>
                  </div>
                  <span className="text-white/50 text-xs">Debit</span>
                </div>

                {/* Card number */}
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg font-semibold text-white tracking-widest">
                    {showNumber ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
                  </p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Card Holder</p>
                  <p className="text-sm font-semibold text-white uppercase tracking-wide truncate">{user.fullName}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-0.5">Expires</p>
                  <p className="text-sm font-semibold text-white">{card.expiry}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black italic text-white/90" style={{ fontFamily: 'serif' }}>VISA</span>
                </div>
              </div>

              {/* Tap to flip hint */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <p className="text-[10px] text-white/30">Tap to flip</p>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col justify-between"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(135deg, #001F45 0%, #002D62 50%, #003F8A 100%)',
              }}
            >
              {/* Magnetic strip */}
              <div className="mt-8 h-12 bg-black/80 w-full" />

              {/* Signature + CVV */}
              <div className="px-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-10 rounded bg-white/90 flex items-center px-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`h-3 w-0.5 ${i % 3 === 0 ? 'bg-gray-300' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">CVV</p>
                    <div className="bg-white rounded px-3 py-1.5">
                      <p className="font-mono text-sm font-bold text-[#1A1A2E] tracking-widest">
                        {showCvv ? card.cvv : '•••'}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 text-center">
                  This card is property of Heritage Community Credit Union. If found, please return to any branch.
                </p>
              </div>

              <div className="px-6 pb-6 flex items-center justify-between">
                <span className="text-2xl font-black italic text-white/90" style={{ fontFamily: 'serif' }}>VISA</span>
                <p className="text-[10px] text-white/30">Tap to flip</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowNumber(v => !v)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1A1A2E] hover:border-navy hover:text-navy transition-colors"
          >
            {showNumber ? <EyeOff size={16} /> : <Eye size={16} />}
            {showNumber ? 'Hide Number' : 'Show Number'}
          </button>
          <button
            onClick={() => setShowCvv(v => !v)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1A1A2E] hover:border-navy hover:text-navy transition-colors"
          >
            {showCvv ? <EyeOff size={16} /> : <Eye size={16} />}
            {showCvv ? 'Hide CVV' : 'Show CVV'}
          </button>
        </div>

        {/* Card details panel */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <p className="text-sm font-semibold text-[#1A1A2E]">Card Details</p>
          </div>
          <dl className="divide-y divide-[#F3F4F6]">
            {[
              { label: 'Card Holder', value: user.fullName },
              { label: 'Card Number', value: showNumber ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber) },
              { label: 'Expiry Date', value: card.expiry },
              { label: 'CVV', value: showCvv ? card.cvv : '•••' },
              { label: 'Card Type', value: 'Visa Debit' },
              { label: 'Card Status', value: 'Active' },
              { label: 'Available Balance', value: formatCurrency(user.balance, currency) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-sm text-[#6B7280]">{label}</dt>
                <dd className="flex items-center gap-2 text-sm font-medium text-[#1A1A2E]">
                  {label === 'Card Status' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      {value}
                    </span>
                  ) : (
                    <span className="font-mono">{value}</span>
                  )}
                  {label === 'Card Number' && (
                    <button onClick={copyCardNumber} className="text-[#6B7280] hover:text-navy transition-colors">
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
          <ShieldCheck size={18} className="text-navy flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Never share your card number, CVV, or PIN with anyone. Heritage Community Credit Union will never ask for these details via email or phone.
          </p>
        </div>

      </main>
    </div>
  )
}
