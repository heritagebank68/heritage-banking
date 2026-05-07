import Link from 'next/link'
import { Zap, Shield, Smartphone } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-bold text-white text-sm">H</div>
          <span className="font-semibold text-[#1A1A2E] text-sm leading-tight">
            Heritage Community<br />Credit Union
          </span>
        </div>
        <Link
          href="/auth"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-hover transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-8 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy">
            <Zap size={12} />
            Banking made simple
          </div>
          <h1 className="text-5xl font-bold text-[#1A1A2E] leading-tight">
            Your Money,<br />
            <span className="text-navy">Your Control</span>
          </h1>
          <p className="text-lg text-[#6B7280] max-w-md">
            Experience seamless banking with Heritage Community Credit Union. Send, receive, and manage your money with ease and security.
          </p>
          <div className="flex gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-hover transition-colors"
            >
              Sign In →
            </Link>
            <a
              href="#features"
              className="inline-flex items-center rounded-lg border-2 border-navy px-6 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Learn More
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#002D62', '#003F8A', '#001F45', '#0051A8'].map((c, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-sm text-[#6B7280]">
              <strong className="text-[#1A1A2E]">50,000+</strong> Happy members
            </span>
          </div>
        </div>

        {/* Balance card preview */}
        <div className="flex-1 max-w-sm w-full">
          <div className="rounded-2xl bg-navy p-6 text-white shadow-xl">
            <p className="text-sm text-white/70 mb-1">Total Balance</p>
            <p className="text-4xl font-bold mb-1">$12,500.00</p>
            <div className="flex justify-between text-xs text-white/60 mb-6">
              <span>Account: •••• 5369</span>
              <span className="bg-white/20 rounded px-2 py-0.5">Savings</span>
            </div>
            <div className="flex gap-3 mb-5">
              {['Send', 'Cards', 'Save'].map(a => (
                <div key={a} className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2.5 flex-1">
                  <div className="h-5 w-5 rounded bg-white/20" />
                  <span className="text-xs">{a}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/60 mb-2">Recent Activity</p>
            {[
              { name: 'Wire Transfer', amt: '-$2,500.00', sign: '-' },
              { name: 'Salary', amt: '+$5,000.00', sign: '+' },
            ].map(tx => (
              <div key={tx.name} className="flex items-center justify-between py-2.5 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${tx.sign === '+' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {tx.sign}
                  </div>
                  <span className="text-sm">{tx.name}</span>
                </div>
                <span className={`text-sm font-medium ${tx.sign === '+' ? 'text-green-300' : 'text-red-300'}`}>{tx.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-8">
          <h2 className="text-3xl font-bold text-center text-[#1A1A2E] mb-3">
            Why Choose Heritage Community Credit Union?
          </h2>
          <p className="text-center text-[#6B7280] mb-12">
            We&apos;ve built the most reliable and member-friendly banking platform for you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Transfers', desc: 'Send money to anyone, anywhere instantly with zero fees' },
              { icon: Shield, title: 'Bank-Grade Security', desc: 'Your money is protected with state-of-the-art encryption' },
              { icon: Smartphone, title: 'Easy to Use', desc: 'Simple, intuitive interface designed for everyone' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-[#E5E7EB] p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-[#1A1A2E]">{title}</h3>
                <p className="text-sm text-[#6B7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20">
        <div className="mx-auto max-w-2xl px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-white/70">
            Join thousands of members who trust Heritage Community Credit Union for their everyday banking needs
          </p>
          <Link
            href="/auth"
            className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-navy hover:bg-white/90 transition-colors"
          >
            Sign In
          </Link>
          <div className="flex justify-center gap-8 text-sm text-white/70 flex-wrap">
            {['No monthly fees', 'Instant transfers', '24/7 support'].map(p => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="text-green-400">✓</span> {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001F45] py-6">
        <div className="mx-auto max-w-6xl px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-navy text-white text-xs font-bold">H</div>
            <span className="text-sm text-white/60">Heritage Community Credit Union</span>
          </div>
          <p className="text-xs text-white/40">© 2026 Heritage Community Credit Union. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
