'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, HeadphonesIcon, Mail, Phone, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col">
      <div className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-navy transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-white text-xl font-bold">H</div>
            <p className="text-base font-semibold text-[#1A1A2E] text-center">Heritage Community Credit Union</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome back</h1>
              <p className="text-sm text-[#6B7280] mt-1">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-navy"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-navy hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 flex-shrink-0">
                <HeadphonesIcon size={20} className="text-navy" />
              </div>
              <button
                onClick={() => setShowForgot(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E]">Reset Your Password</h2>
              <p className="text-sm text-[#6B7280] mt-1">
                For your security, password resets are handled by our support team. Please contact us using one of the methods below and we will verify your identity and reset your password.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="mailto:support@heritageccu.com"
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Mail size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Email Support</p>
                  <p className="text-xs text-[#6B7280]">support@heritageccu.com</p>
                </div>
              </a>

              <a
                href="tel:+18001234567"
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3.5 hover:border-navy hover:bg-navy/5 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors flex-shrink-0">
                  <Phone size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">Call Support</p>
                  <p className="text-xs text-[#6B7280]">+1 (800) 123-4567 · Mon–Fri 9am–5pm</p>
                </div>
              </a>
            </div>

            <button
              onClick={() => setShowForgot(false)}
              className="w-full rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
