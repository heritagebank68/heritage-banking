'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Send, PhoneCall, Mail, ChevronDown, ArrowLeft, Building2, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }

const BANKS_BY_CURRENCY: Record<string, string[]> = {
  USD: [
    'JPMorgan Chase Bank',
    'Bank of America',
    'Wells Fargo Bank',
    'Citibank',
    'U.S. Bancorp',
    'Truist Financial',
    'Goldman Sachs Bank',
    'Morgan Stanley Bank',
    'TD Bank',
    'PNC Bank',
    'Capital One',
    'HSBC Bank USA',
    'Ally Bank',
    'American Express Bank',
    'Discover Bank',
  ],
  GBP: [
    'Barclays Bank',
    'HSBC UK',
    'Lloyds Bank',
    'NatWest',
    'Santander UK',
    'Halifax',
    'Nationwide Building Society',
    'TSB Bank',
    'Metro Bank',
    'Monzo Bank',
    'Starling Bank',
    'First Direct',
    'Royal Bank of Scotland',
    'Virgin Money',
    'Co-operative Bank',
  ],
  EUR: [
    'Deutsche Bank',
    'BNP Paribas',
    'Société Générale',
    'Crédit Agricole',
    'UniCredit',
    'Intesa Sanpaolo',
    'Banco Santander',
    'ING Group',
    'ABN AMRO',
    'Rabobank',
    'Commerzbank',
    'Erste Group Bank',
    'KBC Group',
    'Nordea Bank',
    'La Banque Postale',
  ],
  NGN: [
    'Access Bank',
    'Zenith Bank',
    'Guaranty Trust Bank (GTBank)',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Stanbic IBTC Bank',
    'Fidelity Bank',
    'Sterling Bank',
    'Union Bank of Nigeria',
    'Polaris Bank',
    'Wema Bank',
    'Ecobank Nigeria',
    'Heritage Bank',
    'Jaiz Bank',
    'Keystone Bank',
  ],
  CAD: [
    'Royal Bank of Canada (RBC)',
    'Toronto-Dominion Bank (TD)',
    'Bank of Nova Scotia (Scotiabank)',
    'Bank of Montreal (BMO)',
    'Canadian Imperial Bank of Commerce (CIBC)',
    'National Bank of Canada',
    'HSBC Canada',
    'ATB Financial',
    'Laurentian Bank of Canada',
    'Canadian Western Bank',
    'Tangerine Bank',
    'EQ Bank',
    'Simplii Financial',
    'Meridian Credit Union',
    'Desjardins Group',
  ],
  AUD: [
    'Commonwealth Bank of Australia',
    'Westpac Banking Corporation',
    'Australia and New Zealand Banking Group (ANZ)',
    'National Australia Bank (NAB)',
    'Macquarie Bank',
    'Bendigo and Adelaide Bank',
    'Bank of Queensland',
    'Suncorp Bank',
    'ING Australia',
    'HSBC Australia',
    'Citibank Australia',
    'ME Bank',
    'Bankwest',
    'AMP Bank',
    'Athena Home Loans',
  ],
  JPY: [
    'Japan Post Bank',
    'MUFG Bank (Mitsubishi UFJ)',
    'Sumitomo Mitsui Banking Corporation',
    'Mizuho Bank',
    'Resona Bank',
    'Saitama Resona Bank',
    'Shizuoka Bank',
    'Joyo Bank',
    'Chiba Bank',
    'Fukuoka Bank',
    'Bank of Yokohama',
    'Hiroshima Bank',
    'Ashikaga Bank',
    'Nishi-Nippon City Bank',
    'Shinsei Bank',
  ],
  CHF: [
    'UBS Switzerland',
    'Credit Suisse',
    'Raiffeisen Switzerland',
    'Zürcher Kantonalbank',
    'PostFinance',
    'Luzerner Kantonalbank',
    'Basler Kantonalbank',
    'Berner Kantonalbank',
    'St. Galler Kantonalbank',
    'Valiant Bank',
    'Bank Cler',
    'Hypothekarbank Lenzburg',
    'Migros Bank',
    'Cembra Money Bank',
    'Vontobel',
  ],
  CNY: [
    'Industrial and Commercial Bank of China (ICBC)',
    'China Construction Bank',
    'Agricultural Bank of China',
    'Bank of China',
    'Bank of Communications',
    'China Merchants Bank',
    'Industrial Bank',
    'Shanghai Pudong Development Bank',
    'China Minsheng Banking',
    'China CITIC Bank',
    'Ping An Bank',
    'Hua Xia Bank',
    'Guangfa Bank',
    'Zheshang Bank',
    'WeBank',
  ],
  INR: [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Axis Bank',
    'Canara Bank',
    'Union Bank of India',
    'Bank of India',
    'Kotak Mahindra Bank',
    'IndusInd Bank',
    'Yes Bank',
    'IDBI Bank',
    'Federal Bank',
    'South Indian Bank',
  ],
  BRL: [
    'Itaú Unibanco',
    'Bradesco',
    'Banco do Brasil',
    'Caixa Econômica Federal',
    'Santander Brasil',
    'Nubank',
    'BTG Pactual',
    'Banco Safra',
    'Banco Votorantim',
    'Banrisul',
    'Sicredi',
    'Sicoob',
    'Inter Bank',
    'Banco C6',
    'Original Bank',
  ],
  ZAR: [
    'Standard Bank of South Africa',
    'FirstRand Bank (FNB)',
    'Absa Group',
    'Nedbank',
    'Capitec Bank',
    'Investec Bank',
    'African Bank',
    'TymeBank',
    'Discovery Bank',
    'Bidvest Bank',
    'Grindrod Bank',
    'Mercantile Bank',
    'HBZ Bank',
    'Sasfin Bank',
    'Ubank',
  ],
  MXN: [
    'BBVA México',
    'Banamex (Citibanamex)',
    'Banorte',
    'HSBC México',
    'Santander México',
    'Scotiabank México',
    'Inbursa',
    'Banco Azteca',
    'Banca Afirme',
    'Banco del Ejército (Banjército)',
    'Monexco',
    'Intercam Banco',
    'Banco Multiva',
    'Ve por Más',
    'Nu México (Nubank)',
  ],
  SGD: [
    'DBS Bank',
    'Oversea-Chinese Banking Corporation (OCBC)',
    'United Overseas Bank (UOB)',
    'Standard Chartered Singapore',
    'Citibank Singapore',
    'HSBC Singapore',
    'Maybank Singapore',
    'Bank of China Singapore',
    'Industrial and Commercial Bank of China Singapore',
    'ANZ Singapore',
    'RHB Bank Singapore',
    'CIMB Bank Singapore',
    'GXS Bank',
    'Trust Bank Singapore',
    'Matchmove Bank',
  ],
  AED: [
    'Emirates NBD',
    'First Abu Dhabi Bank (FAB)',
    'Abu Dhabi Commercial Bank (ADCB)',
    'Dubai Islamic Bank',
    'Mashreq Bank',
    'Abu Dhabi Islamic Bank (ADIB)',
    'Commercial Bank of Dubai',
    'Sharjah Islamic Bank',
    'Ras Al Khaimah Bank',
    'National Bank of Fujairah',
    'Bank of Sharjah',
    'Invest Bank',
    'United Arab Bank',
    'Ajman Bank',
    'Emirates Islamic Bank',
  ],
}

function getBanks(currency: string): string[] {
  return BANKS_BY_CURRENCY[currency] ?? BANKS_BY_CURRENCY['USD']
}

type Step = 'form' | 'pin' | 'confirm' | 'support'

export default function TransferPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [step, setStep] = useState<Step>('form')

  // form state — pre-fill from beneficiary query params if present
  const [bank, setBank] = useState(searchParams.get('bank') ?? '')
  const [accountNumber, setAccountNumber] = useState(searchParams.get('account') ?? '')
  const [accountName, setAccountName] = useState(searchParams.get('name') ?? '')
  const [amount, setAmount] = useState('')
  const [narration, setNarration] = useState('')
  const [bankOpen, setBankOpen] = useState(false)

  // pin state
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (!d.success) router.push('/auth')
      else {
        setUser(d.data)
        if (!searchParams.get('bank')) {
          const banks = getBanks(d.data.preferredCurrency ?? 'USD')
          setBank(banks[0])
        }
      }
    })
  }, [router, searchParams])

  if (!user) return null

  const currency = user.preferredCurrency ?? 'USD'
  const banks = getBanks(currency)

  function handleSubmit(e: React.FormEvent) {
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
        setStep('support')
      }
    } catch {
      setPinError('Something went wrong. Please try again.')
    } finally {
      setPinLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar user={user} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 max-w-2xl min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Send size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Transfer</h1>
            <p className="text-sm text-[#6B7280]">Send money to any bank account</p>
          </div>
        </div>

        {/* Balance strip */}
        <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-5 py-4">
          <span className="text-sm text-[#6B7280]">Available Balance</span>
          <span className="text-lg font-bold text-navy">{formatCurrency(user.balance, currency)}</span>
        </div>

        {step === 'form' ? (
          <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-[#1A1A2E]">Bank Transfer</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">Fill in the recipient details below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank selector */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">
                  Recipient Bank
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBankOpen(o => !o)}
                    className="w-full flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 hover:border-navy/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 size={15} className="text-[#6B7280] flex-shrink-0" />
                      {bank || 'Select a bank'}
                    </span>
                    <ChevronDown size={15} className={`text-[#6B7280] transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {bankOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
                      <div className="max-h-52 overflow-y-auto divide-y divide-[#F3F4F6]">
                        {banks.map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => { setBank(b); setBankOpen(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-navy/5 ${bank === b ? 'bg-navy/5 font-semibold text-navy' : 'text-[#1A1A2E]'}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Input
                label="Account Number"
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                required
              />

              <Input
                label="Account Name"
                type="text"
                placeholder="Enter recipient's full name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">Amount ({currency})</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-colors"
                />
              </div>

              <Input
                label="Narration (Optional)"
                placeholder="e.g. Rent payment"
                value={narration}
                onChange={e => setNarration(e.target.value)}
              />

              <Button type="submit" className="w-full py-3">
                Proceed to Transfer
              </Button>
            </form>
          </div>
        ) : step === 'pin' ? (
          <div className="space-y-4">
            {/* Transfer summary (compact) */}
            <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-semibold text-[#1A1A2E]">Transfer Summary</span>
              </div>
              <dl className="divide-y divide-[#F3F4F6]">
                {[
                  { label: 'Bank', value: bank },
                  { label: 'Account Number', value: accountNumber },
                  { label: 'Account Name', value: accountName },
                  { label: 'Amount', value: formatCurrency(Number(amount), currency) },
                  ...(narration ? [{ label: 'Narration', value: narration }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <dt className="text-sm text-[#6B7280]">{label}</dt>
                    <dd className="text-sm font-medium text-[#1A1A2E] text-right max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* PIN entry */}
            <div className="rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E]">Enter Transaction PIN</h2>
                  <p className="text-sm text-[#6B7280]">Enter your 4-digit PIN to authorize this transfer</p>
                </div>
              </div>

              {pinError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {pinError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-colors ${
                        pin.length > i ? 'border-navy bg-navy/5 text-navy' : 'border-[#E5E7EB] text-[#E5E7EB]'
                      }`}
                    >
                      {pin.length > i ? '●' : '○'}
                    </div>
                  ))}
                </div>

                {/* Hidden input to capture PIN */}
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setPin(e.target.value) }}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 text-center tracking-[0.5em] font-bold"
                  placeholder="Enter 4-digit PIN"
                />

                <Button type="submit" loading={pinLoading} className="w-full py-3">
                  <ShieldCheck size={16} className="mr-2" /> Authorize Transfer
                </Button>
              </form>
            </div>

            <button
              onClick={() => { setStep('form'); setPin(''); setPinError('') }}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors"
            >
              <ArrowLeft size={15} /> Back to transfer form
            </button>
          </div>

        ) : step === 'confirm' ? (
          <div className="space-y-4">
            {/* Confirmation summary */}
            <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-semibold text-[#1A1A2E]">Review Transfer</span>
              </div>
              <dl className="divide-y divide-[#F3F4F6]">
                {[
                  { label: 'Bank', value: bank },
                  { label: 'Account Number', value: accountNumber },
                  { label: 'Account Name', value: accountName },
                  { label: 'Amount', value: formatCurrency(Number(amount), currency) },
                  ...(narration ? [{ label: 'Narration', value: narration }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <dt className="text-sm text-[#6B7280]">{label}</dt>
                    <dd className="text-sm font-medium text-[#1A1A2E] text-right max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Confirmation prompt */}
            <div className="rounded-2xl bg-white border border-amber-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Are you sure?</h2>
                  <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                    You are about to send{' '}
                    <span className="font-semibold text-[#1A1A2E]">{formatCurrency(Number(amount), currency)}</span>{' '}
                    to <span className="font-semibold text-[#1A1A2E]">{accountName}</span> at{' '}
                    <span className="font-semibold text-[#1A1A2E]">{bank}</span>. Please confirm to proceed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('pin')}
                  className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-3 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('support')}
                  className="flex-1 rounded-lg bg-navy py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
                >
                  Yes, Proceed
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors"
            >
              <ArrowLeft size={15} /> Back to transfer form
            </button>
          </div>

        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors"
            >
              <ArrowLeft size={15} /> Back to transfer form
            </button>

            {/* Contact support card */}
            <div className="rounded-2xl bg-white border border-blue-200 p-6 md:p-8 space-y-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <Send size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E]">Complete Your Transfer</h2>
                  <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                    To protect your funds, this transfer must be authorized through our support team.
                    Please contact us with your transfer details and we will process it promptly and securely.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-5 space-y-3">
                <a
                  href="tel:+18001234567"
                  className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">Call Us</p>
                    <p className="text-xs text-[#6B7280]">+1 (800) 123-4567 — Mon–Fri, 8am–6pm</p>
                  </div>
                </a>

                <a
                  href="mailto:support@hccu.org"
                  className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors"
                >
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
