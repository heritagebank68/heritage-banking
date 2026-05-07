'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, Send,
  Receipt, Settings, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deposit', label: 'Deposit', icon: ArrowDownLeft },
  { href: '/withdraw', label: 'Withdraw', icon: ArrowUpRight },
  { href: '/transfer', label: 'Transfer', icon: Send },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  user: { fullName: string; accountNumber: string; balance: number }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-bold text-sm flex-shrink-0">H</div>
        <span className="text-xs font-semibold leading-tight">Heritage Community<br />Credit Union</span>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-white/50 font-mono">{user.accountNumber}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-navy text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#001F45] text-white z-20 flex items-center justify-between px-4 shadow-lg">
        <Link
          href="/settings"
          className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <Settings size={22} />
        </Link>

        <span className="text-sm font-bold tracking-wide">Heritage CU</span>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-[#001F45] text-white fixed left-0 top-0 z-10">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#001F45] text-white shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
