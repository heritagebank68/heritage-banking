'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Users, UserPlus, Landmark, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Members', icon: Users },
  { href: '/admin/dashboard/create-user', label: 'Create Member', icon: UserPlus },
  { href: '/admin/dashboard/fund', label: 'Fund Account', icon: Landmark },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#001F45] text-white fixed left-0 top-0 z-10">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-bold text-sm flex-shrink-0">H</div>
        <div className="min-w-0">
          <span className="text-xs font-semibold leading-tight block">Heritage Community</span>
          <span className="text-xs text-white/50">Admin Portal</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
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
    </aside>
  )
}
