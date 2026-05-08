'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDownLeft, Building2, CheckSquare, Landmark,
  PhoneCall, Mail, ArrowLeft, KeyRound, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }

type Method = 'direct' | 'check' | 'atm'
type Step = 'method' | 'form' | 'pin' | 'confirm' | 'support'

const METHODS = [
  {
    id: 'direct' as Method,
    label: 'Direct Deposit',
    subtitle: 'Transfer from another bank account',
    icon: Building2,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    activeColor: 'border-blue-500 bg-blue-50',
  },
  {
    id: 'check' as Method,
    label: 'Check Deposit',
    subtitle: 'Deposit a personal or cashier\'s check',
    icon: CheckSquare,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    activeColor: 'border-purple-500 bg-purple-50',
  },
  {
    id: 'atm' as Method,
    label: 'ATM Deposit',
    subtitle: 'Deposit cash or check at an ATM',
    icon: Landmark,
    color: 'text-green-600 bg-green-50 border-green-200',
    activeColor: 'border-green-500 bg-green-50',
  },
]

export default function DepositPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [step, setStep] = useState<Step>('method')
  const [method, setMethod] = useState<Method | null>(null)

  // Direct deposit fields
  const [bankName, setBankName] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [fromAccount, setFromAccount] = useState('')

  // Check deposit fields
  const [checkNumber, setCheckNumber] = useState('')
  const [issuingBank, setIssuingBank] = useState('')
  const [checkType, setCheckType] = useState<'personal' | 'cashier' | 'payroll'>('personal')

  // ATM fields
  const [atmLocation, setAtmLocation] = useState('')
  const [atmDepositType, setAtmDepositType] = useState<'cash' | 'check'>('cash')

  // Shared
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  // PIN
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (!d.success) router.push('/auth')
      else setUser(d.data)
    })
  }, [router])

  if (!user) return null

  const currency = user.preferredCurrency ?? 'USD'
  const selectedMethod = METHODS.find(m => m.id === method)

  function handleMethodSelect(m: Method) {
    setMethod(m)
    setStep('form')
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('pin')
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPinError('')
    setPinLoading(true)
    try {
      const res = await fetch('/api/users/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!data.success) {
        setPinError(data.message)
      } else {
        setPin('')
        setStep('confirm')
      }
    } catch {
      setPinError('Something went wrong. Please try again.')
    } finally {
      setPinLoading(false)
    }
  }

  // Build a summary of the deposit details based on method
  function getSummaryRows() {
    const base = [
      { label: 'Deposit Method', value: selectedMethod?.label ?? '' },
      { label: 'Amount', value: formatCurrency(Number(amount), currency) },
    ]
    if (method === 'direct') return [
      ...base,
      { label: 'Bank Name', value: bankName },
      { label: 'Routing Number', value: routingNumber },
      { label: 'From Account', value: fromAccount },
      ...(description ? [{ label: 'Description', value: description }] : []),
    ]
    if (method === 'check') return [
      ...base,
      { label: 'Check Type', value: checkType.charAt(0).toUpperCase() + checkType.slice(1) },
      { label: 'Check Number', value: checkNumber },
      { label: 'Issuing Bank', value: issuingBank },
      ...(description ? [{ label: 'Description', value: description }] : []),
    ]
    // atm
    return [
      ...base,
      { label: 'ATM Location', value: atmLocation },
      { label: 'Deposit Type', value: atmDepositType === 'cash' ? 'Cash' : 'Check' },
      ...(description ? [{ label: 'Description', value: description }] : []),
    ]
  }

  const summaryRows = getSummaryRows()

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar user={user} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 max-w-2xl min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Deposit</h1>
            <p className="text-sm text-[#6B7280]">Add funds to your account</p>
          </div>
        </div>

        {/* Balance strip */}
        <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-5 py-4">
          <span className="text-sm text-[#6B7280]">Available Balance</span>
          <span className="text-lg font-bold text-navy">{formatCurrency(user.balance, currency)}</span>
        </div>

        {/* ── STEP 1: Choose method ── */}
        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1A1A2E]">Select Deposit Method</p>
            {METHODS.map(({ id, label, subtitle, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => handleMethodSelect(id)}
                className="w-full flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 text-left hover:border-navy hover:shadow-sm transition-all"
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>
                </div>
                <span className="ml-auto text-[#6B7280]">›</span>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 2: Fill form ── */}
        {step === 'form' && selectedMethod && (
          <div className="space-y-4">
            <button onClick={() => setStep('method')}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
              <ArrowLeft size={15} /> Back to deposit methods
            </button>
          <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${selectedMethod.color}`}>
                <selectedMethod.icon size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1A2E]">{selectedMethod.label}</h2>
                <p className="text-sm text-[#6B7280]">{selectedMethod.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">

              {/* Direct Deposit fields */}
              {method === 'direct' && <>
                <Input label="Bank Name" placeholder="e.g. Chase Bank" value={bankName} onChange={e => setBankName(e.target.value)} required />
                <Input label="Routing Number" placeholder="9-digit routing number" value={routingNumber}
                  onChange={e => { if (/^\d{0,9}$/.test(e.target.value)) setRoutingNumber(e.target.value) }} required />
                <Input label="From Account Number" placeholder="Account number" value={fromAccount}
                  onChange={e => { if (/^\d{0,17}$/.test(e.target.value)) setFromAccount(e.target.value) }} required />
              </>}

              {/* Check Deposit fields */}
              {method === 'check' && <>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[#1A1A2E]">Check Type</label>
                  <div className="flex gap-2">
                    {(['personal', 'cashier', 'payroll'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setCheckType(t)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors capitalize ${
                          checkType === t
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy hover:text-navy'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Check Number" placeholder="e.g. 1042" value={checkNumber}
                  onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) setCheckNumber(e.target.value) }} required />
                <Input label="Issuing Bank" placeholder="e.g. Wells Fargo" value={issuingBank} onChange={e => setIssuingBank(e.target.value)} required />
              </>}

              {/* ATM Deposit fields */}
              {method === 'atm' && <>
                <Input label="ATM Location" placeholder="e.g. 123 Main St, New York" value={atmLocation} onChange={e => setAtmLocation(e.target.value)} required />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[#1A1A2E]">Deposit Type</label>
                  <div className="flex gap-2">
                    {(['cash', 'check'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setAtmDepositType(t)}
                        className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors capitalize ${
                          atmDepositType === t
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy hover:text-navy'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>}

              {/* Shared fields */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">Amount ({currency})</label>
                <input type="number" min="0.01" step="0.01" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)} required
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" />
              </div>
              <Input label="Description (Optional)" placeholder="e.g. Paycheck" value={description} onChange={e => setDescription(e.target.value)} />

              <Button type="submit" className="w-full py-3">Continue</Button>
            </form>
          </div>
          </div>
        )}

        {/* ── STEP 3: PIN ── */}
        {step === 'pin' && (
          <div className="space-y-4">
            <button onClick={() => { setStep('form'); setPin(''); setPinError('') }}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-semibold text-[#1A1A2E]">Deposit Summary</span>
              </div>
              <dl className="divide-y divide-[#F3F4F6]">
                {summaryRows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <dt className="text-sm text-[#6B7280]">{label}</dt>
                    <dd className="text-sm font-medium text-[#1A1A2E] text-right max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E]">Enter Transaction PIN</h2>
                  <p className="text-sm text-[#6B7280]">Enter your 4-digit PIN to authorize this deposit</p>
                </div>
              </div>

              {pinError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{pinError}</div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                      pin.length > i ? 'border-navy bg-navy/5 text-navy' : 'border-[#E5E7EB] text-[#E5E7EB]'
                    }`}>
                      {pin.length > i ? '●' : '○'}
                    </div>
                  ))}
                </div>
                <input type="password" inputMode="numeric" maxLength={4} value={pin}
                  onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPin(e.target.value) }}
                  required autoFocus
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 text-center tracking-[0.5em] font-bold"
                  placeholder="Enter 4-digit PIN" />
                <Button type="submit" loading={pinLoading} className="w-full py-3">
                  <ShieldCheck size={16} className="mr-2" /> Authorize Deposit
                </Button>
              </form>
            </div>

          </div>
        )}

        {/* ── STEP 4: Confirm ── */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <button onClick={() => setStep('method')}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
              <ArrowLeft size={15} /> Back to deposit methods
            </button>
            <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-semibold text-[#1A1A2E]">Review Deposit</span>
              </div>
              <dl className="divide-y divide-[#F3F4F6]">
                {summaryRows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <dt className="text-sm text-[#6B7280]">{label}</dt>
                    <dd className="text-sm font-medium text-[#1A1A2E] text-right max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl bg-white border border-amber-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Are you sure?</h2>
                  <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                    You are about to deposit{' '}
                    <span className="font-semibold text-[#1A1A2E]">{formatCurrency(Number(amount), currency)}</span>{' '}
                    via <span className="font-semibold text-[#1A1A2E]">{selectedMethod?.label}</span>. Please confirm to proceed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep('pin')}
                  className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-3 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                  Cancel
                </button>
                <button onClick={() => setStep('support')}
                  className="flex-1 rounded-lg bg-navy py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors">
                  Yes, Proceed
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 5: Contact support ── */}
        {step === 'support' && (
          <div className="space-y-4">
            <button onClick={() => { setStep('method'); setMethod(null); setAmount(''); setDescription('') }}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
              <ArrowLeft size={15} /> Make another deposit
            </button>
            <div className="rounded-2xl bg-white border border-green-200 p-6 md:p-8 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <ArrowDownLeft size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Complete Your Deposit</h2>
                  <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                    Your deposit request has been received. Please contact our support team to finalize the deposit and have it credited to your account.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-5 space-y-3">
                <a href="tel:+18001234567"
                  className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">Call Us</p>
                    <p className="text-xs text-[#6B7280]">+1 (800) 123-4567 — Mon–Fri, 8am–6pm</p>
                  </div>
                </a>
                <a href="mailto:support@hccu.org"
                  className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">Email Us</p>
                    <p className="text-xs text-[#6B7280]">support@hccu.org — We reply within 24 hours</p>
                  </div>
                </a>
              </div>

              <p className="text-xs text-[#9CA3AF] text-center pt-1">
                Your account: <span className="font-mono font-semibold">{user.accountNumber}</span>
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
