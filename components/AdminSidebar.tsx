'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, UserPlus, Landmark, Receipt, LogOut, Menu, X, BadgeDollarSign } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Members', icon: Users },
  { href: '/admin/dashboard/create-user', label: 'Create Member', icon: UserPlus },
  { href: '/admin/dashboard/fund', label: 'Fund Account', icon: Landmark },
  { href: '/admin/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/admin/dashboard/loans', label: 'Loan Applications', icon: BadgeDollarSign },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-bold text-sm flex-shrink-0">H</div>
        <div className="min-w-0">
          <span className="text-xs font-semibold leading-tight block">Heritage Community</span>
          <span className="text-xs text-white/50">Admin Portal</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin/dashboard'
            ? pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard/members')
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? 'bg-navy text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
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
        <span className="text-sm font-bold tracking-wide">Admin Portal</span>
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
