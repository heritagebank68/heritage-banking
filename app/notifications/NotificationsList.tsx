'use client'
import { useState } from 'react'
import { Bell, CheckCheck, TrendingUp, TrendingDown, Info, AlertTriangle } from 'lucide-react'
import type { Notification } from '@/lib/types'

const TYPE_CONFIG = {
  credit: { icon: TrendingUp,      bg: 'bg-green-100',  text: 'text-green-600' },
  debit:  { icon: TrendingDown,    bg: 'bg-red-100',    text: 'text-red-500'   },
  info:   { icon: Info,            bg: 'bg-blue-100',   text: 'text-blue-600'  },
  alert:  { icon: AlertTriangle,   bg: 'bg-amber-100',  text: 'text-amber-600' },
}

export default function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [marking, setMarking] = useState(false)

  const unread = notifications.filter(n => !n.read).length

  async function markOne(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAll() {
    setMarking(true)
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'mark-all-read' }) })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarking(false)
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-[#E5E7EB] p-16 flex flex-col items-center text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
          <Bell size={24} className="text-[#9CA3AF]" />
        </div>
        <p className="text-sm font-medium text-[#1A1A2E]">No notifications yet</p>
        <p className="text-xs text-[#6B7280]">We'll notify you when something important happens</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">{unread} unread</span>
          <button onClick={markAll} disabled={marking}
            className="flex items-center gap-1.5 text-xs font-medium text-navy hover:underline disabled:opacity-50">
            <CheckCheck size={13} /> Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map(n => {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
          const Icon = cfg.icon
          return (
            <div key={n.id}
              onClick={() => !n.read && markOne(n.id)}
              className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition-all cursor-pointer ${
                n.read
                  ? 'border-[#E5E7EB] bg-white'
                  : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50'
              }`}>
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.text}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.read ? 'text-[#1A1A2E]' : 'text-navy'}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-[#9CA3AF] mt-1.5">
                  {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
