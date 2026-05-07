'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, PhoneCall, Mail, AlertCircle } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(d => {
      if (!d.success) router.push('/auth')
      else setUser(d.data)
    })
  }, [router])

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar user={user} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-20 md:pt-8 space-y-6 max-w-2xl min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Withdraw</h1>
            <p className="text-sm text-[#6B7280]">Withdraw funds from your account</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-orange-200 p-6 md:p-8 space-y-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E]">Contact Support to Withdraw</h2>
              <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                For your security, withdrawals must be processed through our support team.
                Please reach out to us via any of the channels below and we will assist you promptly.
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
            Please have your account number <span className="font-mono font-semibold">{user.accountNumber}</span> ready when you contact us.
          </p>
        </div>
      </main>
    </div>
  )
}
