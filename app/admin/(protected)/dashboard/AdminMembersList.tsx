'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Pencil, Trash2, KeyRound, Eye, X, Check, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CURRENCIES } from '@/lib/utils'

interface Member {
  id: string
  fullName: string
  email: string
  phone: string
  accountNumber: string
  accountType: string
  preferredCurrency?: string
  balance: number
  createdAt: string
}

interface EditForm { fullName: string; email: string; phone: string; accountType: string; preferredCurrency: string }

export default function AdminMembersList({ initialMembers }: { initialMembers: Member[] }) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [search, setSearch] = useState('')

  const [editId, setEditId]       = useState<string | null>(null)
  const [editForm, setEditForm]   = useState<EditForm>({ fullName: '', email: '', phone: '', accountType: 'Savings', preferredCurrency: 'USD' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [resetId, setResetId]     = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  const filtered = members.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.accountNumber.includes(search)
  )

  function openEdit(m: Member) {
    setEditId(m.id)
    setEditForm({ fullName: m.fullName, email: m.email, phone: m.phone || '', accountType: m.accountType, preferredCurrency: m.preferredCurrency ?? 'USD' })
    setEditError('')
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true); setEditError('')
    try {
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!data.success) { setEditError(data.message); return }
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...editForm } : m))
      setEditId(null)
    } catch { setEditError('Something went wrong.') }
    finally { setEditLoading(false) }
  }

  async function confirmDelete(id: string) {
    setDeleteLoading(true)
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setMembers(prev => prev.filter(m => m.id !== id))
      setDeleteId(null)
    } finally { setDeleteLoading(false) }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true); setResetError(''); setResetSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${resetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', newPassword }),
      })
      const data = await res.json()
      if (!data.success) { setResetError(data.message); return }
      setResetSuccess('Password reset successfully.')
      setNewPassword('')
    } catch { setResetError('Something went wrong.') }
    finally { setResetLoading(false) }
  }

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search by name, email or account number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Members</span>
          <span className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
            {filtered.length}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E5E7EB]">
                <tr>
                  {['Full Name', 'Email', 'Account Number', 'Type', 'Currency', 'Balance', 'Joined', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5 font-medium text-[#1A1A2E] whitespace-nowrap">{m.fullName}</td>
                    <td className="px-4 py-3.5 text-[#6B7280]">{m.email}</td>
                    <td className="px-4 py-3.5 font-mono text-[#6B7280]">{m.accountNumber}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-medium text-navy">{m.accountType}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280]">{m.preferredCurrency ?? 'USD'}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#1A1A2E] whitespace-nowrap">{formatCurrency(m.balance, m.preferredCurrency)}</td>
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/admin/dashboard/members/${m.id}`)}
                          title="View transactions"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-navy/10 hover:text-navy transition-colors">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEdit(m)} title="Edit member"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setResetId(m.id); setResetError(''); setResetSuccess(''); setNewPassword('') }} title="Reset password"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-amber-50 hover:text-amber-600 transition-colors">
                          <KeyRound size={14} />
                        </button>
                        <button onClick={() => setDeleteId(m.id)} title="Delete member"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => router.push(`/admin/dashboard/members/${m.id}`)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B7280] hover:bg-navy/10 hover:text-navy transition-colors">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Edit Member</h2>
              <button onClick={() => setEditId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"><X size={16} /></button>
            </div>
            {editError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{editError}</div>}
            <form onSubmit={submitEdit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
              ].map(({ label, key, type }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-[#1A1A2E]">{label}</label>
                  <input type={type} value={editForm[key as keyof EditForm]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[#1A1A2E]">Account Type</label>
                  <select value={editForm.accountType} onChange={e => setEditForm(f => ({ ...f, accountType: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
                    <option value="Savings">Savings</option>
                    <option value="Checking">Checking</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-[#1A1A2E]">Currency</label>
                  <select value={editForm.preferredCurrency} onChange={e => setEditForm(f => ({ ...f, preferredCurrency: e.target.value }))}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditId(null)}
                  className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50 transition-colors">
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Delete Member?</h2>
              <p className="text-sm text-[#6B7280] mt-1">This will permanently remove the member and cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteId!)} disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A2E]">Reset Password</h2>
              <button onClick={() => setResetId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"><X size={16} /></button>
            </div>
            {resetError   && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{resetError}</div>}
            {resetSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <Check size={14} /> {resetSuccess}
              </div>
            )}
            <form onSubmit={submitReset} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#1A1A2E]">New Password</label>
                <input type="password" minLength={8} placeholder="Min. 8 characters" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetId(null)}
                  className="flex-1 rounded-lg border-2 border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#6B7280] hover:border-navy hover:text-navy transition-colors">
                  Close
                </button>
                <button type="submit" disabled={resetLoading}
                  className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
                  {resetLoading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
