# Admin Dashboard, Settings & Multi-Currency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Settings page, Admin login, Admin dashboard (users list / create user / fund account), and add per-user preferred currency display throughout the app.

**Architecture:** Option C sidebar layout — Admin section mirrors the user dashboard with a fixed `AdminSidebar`, protected by a server-side auth guard in `app/admin/(protected)/layout.tsx`. A Next.js route group `(protected)` is used so the auth guard does NOT wrap `/admin/login` (avoiding an infinite redirect loop). URLs are unaffected — `(protected)` is invisible in the URL. Currency is display-only; `formatCurrency(amount, currency)` in `lib/utils.ts` replaces all hardcoded `$` formatting. Preferred currency is set once at account creation by admin.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, `jose` (JWT), `bcryptjs`, `uuid`, `Intl.NumberFormat` (built-in)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `lib/types.ts` | Add `preferredCurrency?: string` to User |
| Modify | `lib/utils.ts` | Add `formatCurrency` + `CURRENCIES` constant |
| Modify | `app/api/admin/users/route.ts` | Accept + persist `preferredCurrency` |
| Modify | `app/dashboard/page.tsx` | Use `formatCurrency` |
| Modify | `app/transactions/page.tsx` | Use `formatCurrency` |
| Modify | `app/deposit/page.tsx` | Add `preferredCurrency` to local type, use `formatCurrency` |
| Modify | `app/withdraw/page.tsx` | Same as deposit |
| Modify | `app/transfer/page.tsx` | Same as deposit |
| Create | `app/settings/page.tsx` | Profile view + password change |
| Create | `components/AdminSidebar.tsx` | Fixed nav for admin section |
| Create | `app/admin/login/page.tsx` | Admin login form |
| Create | `app/admin/(protected)/layout.tsx` | Auth guard + AdminSidebar wrapper (route group keeps login unprotected) |
| Create | `app/admin/(protected)/dashboard/page.tsx` | Users list table |
| Create | `app/admin/(protected)/dashboard/create-user/page.tsx` | Create user form with currency picker |
| Create | `app/admin/(protected)/dashboard/fund/page.tsx` | Credit/debit user account |

---

## Task 1: Add `preferredCurrency` to User type and currency utility

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/utils.ts`

- [ ] **Step 1: Update `lib/types.ts`**

Replace the existing `User` interface with:

```typescript
export interface User {
  id: string
  fullName: string
  email: string
  password: string
  phone: string
  accountNumber: string
  accountType: 'Savings' | 'Checking'
  preferredCurrency?: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: 'credit' | 'debit'
  category: 'Transfer' | 'Deposit' | 'Withdrawal' | 'Admin Credit' | 'Admin Debit'
  amount: number
  description: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}
```

- [ ] **Step 2: Update `lib/utils.ts`**

Replace the full file with:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
]
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to these files).

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add lib/types.ts lib/utils.ts
git commit -m "feat: add preferredCurrency to User type and formatCurrency utility"
```

---

## Task 2: Update admin users API to accept `preferredCurrency`

**Files:**
- Modify: `app/api/admin/users/route.ts`

- [ ] **Step 1: Update the POST handler**

In `app/api/admin/users/route.ts`, update the `POST` function body. Replace everything from `const { fullName, email, password, phone, accountType } = await req.json()` through the end of the function with:

```typescript
export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phone, accountType, preferredCurrency } = await req.json()

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, email and password are required' },
        { status: 400 }
      )
    }

    const users = getUsers()
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 })
    }

    const newUser = {
      id: uuidv4(),
      fullName,
      email,
      password: await bcrypt.hash(password, 10),
      phone: phone || '',
      accountNumber: generateAccountNumber(),
      accountType: (accountType as 'Savings' | 'Checking') || 'Savings',
      preferredCurrency: preferredCurrency || 'USD',
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveUsers(users)

    const { password: _p, ...safeUser } = newUser
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add app/api/admin/users/route.ts
git commit -m "feat: persist preferredCurrency when creating user via admin API"
```

---

## Task 3: Update existing user-facing pages to use `formatCurrency`

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/transactions/page.tsx`
- Modify: `app/deposit/page.tsx`
- Modify: `app/withdraw/page.tsx`
- Modify: `app/transfer/page.tsx`

### 3a — Dashboard

- [ ] **Step 1: Update `app/dashboard/page.tsx`**

Add import at the top:
```typescript
import { formatCurrency } from '@/lib/utils'
```

Replace the balance display line inside the balance card:
```typescript
// OLD
<p className="text-4xl font-bold mb-4">
  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</p>

// NEW
<p className="text-4xl font-bold mb-4">
  {formatCurrency(balance, user.preferredCurrency)}
</p>
```

Replace the recent transaction amounts (two occurrences inside the `userTxs.map`):
```typescript
// OLD (amount)
{tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

// NEW
{tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.type === 'debit' ? -tx.amount : tx.amount, user.preferredCurrency)}
```

```typescript
// OLD (balance after)
Bal: ${tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}

// NEW
Bal: {formatCurrency(tx.balanceAfter, user.preferredCurrency)}
```

### 3b — Transactions

- [ ] **Step 2: Update `app/transactions/page.tsx`**

Add import:
```typescript
import { formatCurrency } from '@/lib/utils'
```

Replace the two amount displays inside `txs.map(tx => ...)`:
```typescript
// OLD (amount)
{tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

// NEW
{tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.type === 'debit' ? -tx.amount : tx.amount, user.preferredCurrency)}
```

```typescript
// OLD (balance after)
Bal: ${tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}

// NEW
Bal: {formatCurrency(tx.balanceAfter, user.preferredCurrency)}
```

### 3c — Deposit

- [ ] **Step 3: Update `app/deposit/page.tsx`**

Add import:
```typescript
import { formatCurrency } from '@/lib/utils'
```

Update the local `UserData` interface:
```typescript
interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }
```

Replace the balance bar:
```typescript
// OLD
<span className="text-sm text-[#6B7280]">Available Balance (USD)</span>
<span className="text-lg font-bold text-navy">
  ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
</span>

// NEW
<span className="text-sm text-[#6B7280]">Available Balance</span>
<span className="text-lg font-bold text-navy">
  {formatCurrency(user.balance, user.preferredCurrency)}
</span>
```

Remove the hardcoded `$` prefix span and the `pl-7` padding from the amount input. Replace the amount field block:
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-[#1A1A2E]">Amount</label>
  <input
    type="number" min="0.01" step="0.01" placeholder="0.00"
    value={amount} onChange={e => setAmount(e.target.value)} required
    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
  />
</div>
```

### 3d — Withdraw

- [ ] **Step 4: Update `app/withdraw/page.tsx`**

Apply identical changes as deposit (same pattern — import `formatCurrency`, update `UserData` interface, replace balance bar, update amount input label and remove `$` prefix).

```typescript
import { formatCurrency } from '@/lib/utils'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }
```

Balance bar:
```tsx
<span className="text-sm text-[#6B7280]">Available Balance</span>
<span className="text-lg font-bold text-navy">
  {formatCurrency(user.balance, user.preferredCurrency)}
</span>
```

Amount field (remove `$` prefix span, remove `pl-7`):
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-[#1A1A2E]">Amount</label>
  <input
    type="number" min="0.01" step="0.01" placeholder="0.00"
    value={amount} onChange={e => setAmount(e.target.value)} required
    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
  />
</div>
```

### 3e — Transfer

- [ ] **Step 5: Update `app/transfer/page.tsx`**

Same pattern:

```typescript
import { formatCurrency } from '@/lib/utils'

interface UserData { fullName: string; accountNumber: string; balance: number; preferredCurrency?: string }
```

Balance bar:
```tsx
<span className="text-sm text-[#6B7280]">Available Balance</span>
<span className="text-lg font-bold text-navy">
  {formatCurrency(user.balance, user.preferredCurrency)}
</span>
```

Amount field (remove `$` prefix span, remove `pl-7`):
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-[#1A1A2E]">Amount</label>
  <input
    type="number" min="0.01" step="0.01" placeholder="0.00"
    value={amount} onChange={e => setAmount(e.target.value)} required
    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
  />
</div>
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add app/dashboard/page.tsx app/transactions/page.tsx app/deposit/page.tsx app/withdraw/page.tsx app/transfer/page.tsx
git commit -m "feat: use formatCurrency with user preferredCurrency across all pages"
```

---

## Task 4: Settings page

**Files:**
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create `app/settings/page.tsx`**

```tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyUserToken, USER_COOKIE } from '@/lib/auth'
import { getUsers, getTransactions } from '@/lib/db'
import { getUserBalance } from '@/lib/balance'
import { Sidebar } from '@/components/Sidebar'
import { formatCurrency } from '@/lib/utils'
import PasswordForm from './PasswordForm'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) redirect('/auth')

  let userId: string
  try {
    const payload = await verifyUserToken(token)
    userId = payload.userId
  } catch {
    redirect('/auth')
  }

  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) redirect('/auth')

  const transactions = getTransactions()
  const balance = getUserBalance(userId, transactions)

  const fields = [
    { label: 'Full Name', value: user.fullName },
    { label: 'Email Address', value: user.email },
    { label: 'Phone', value: user.phone || '—' },
    { label: 'Account Number', value: user.accountNumber },
    { label: 'Account Type', value: user.accountType },
    { label: 'Preferred Currency', value: user.preferredCurrency ?? 'USD' },
    { label: 'Current Balance', value: formatCurrency(balance, user.preferredCurrency) },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ fullName: user.fullName, accountNumber: user.accountNumber, balance }} />
      <main className="ml-64 flex-1 p-8 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Settings</h1>
            <p className="text-sm text-[#6B7280]">Manage your account preferences</p>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1A1A2E]">Profile Information</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Contact your branch to update profile information</p>
          </div>
          <dl className="divide-y divide-[#E5E7EB]">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-3.5">
                <dt className="text-sm text-[#6B7280]">{label}</dt>
                <dd className="text-sm font-medium text-[#1A1A2E]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Password */}
        <PasswordForm />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/settings/PasswordForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')

    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setSuccess('Password updated successfully.')
        setCurrent(''); setNext(''); setConfirm('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB]">
        <h2 className="font-semibold text-[#1A1A2E]">Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}
        <Input label="Current Password" type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
        <Input label="New Password" type="password" value={next} onChange={e => setNext(e.target.value)} required />
        <Input label="Confirm New Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full py-3">Update Password</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add app/settings/
git commit -m "feat: add settings page with profile view and password change"
```

---

## Task 5: AdminSidebar component

**Files:**
- Create: `components/AdminSidebar.tsx`

- [ ] **Step 1: Create `components/AdminSidebar.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add components/AdminSidebar.tsx
git commit -m "feat: add AdminSidebar component"
```

---

## Task 6: Admin login page

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create `app/admin/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        router.push('/admin/dashboard')
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
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-white">
              <ShieldCheck size={28} />
            </div>
            <p className="text-base font-semibold text-[#1A1A2E] text-center">Admin Portal</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Administrator Sign In</h1>
              <p className="text-sm text-[#6B7280] mt-1">Enter your admin credentials to continue</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
              </div>
              <Button type="submit" className="w-full py-3" loading={loading}>Sign In</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

## Task 7: Admin layout (auth guard using route group)

**Files:**
- Create: `app/admin/(protected)/layout.tsx`

**Why a route group?** In Next.js App Router, a layout at `app/admin/layout.tsx` would wrap ALL routes under `/admin/`, including `/admin/login`. That causes an infinite redirect loop (no token → redirect to login → layout runs again → no token → loop). The `(protected)` route group places the layout one level deeper so it only wraps dashboard pages, not the login page. The `(protected)` folder name is invisible in URLs — `/admin/dashboard` still works correctly.

- [ ] **Step 1: Create `app/admin/(protected)/layout.tsx`**

```tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'
import { AdminSidebar } from '@/components/AdminSidebar'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value

  if (!token) redirect('/admin/login')

  try {
    await verifyAdminToken(token)
  } catch {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add "app/admin/(protected)/layout.tsx"
git commit -m "feat: add admin protected layout with auth guard using route group"
```

---

## Task 8: Admin dashboard — Users list

**Files:**
- Create: `app/admin/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Create `app/admin/(protected)/dashboard/page.tsx`**

```tsx
import { getUsers, getTransactions } from '@/lib/db'
import { getUserBalance } from '@/lib/balance'
import { formatCurrency } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = getUsers()
  const transactions = getTransactions()

  const members = users.map(({ password: _p, ...u }) => ({
    ...u,
    balance: getUserBalance(u.id, transactions),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Members</h1>
            <p className="text-sm text-[#6B7280]">All registered members</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden">
        {members.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Full Name', 'Email', 'Account Number', 'Type', 'Currency', 'Balance', 'Joined'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{m.fullName}</td>
                    <td className="px-5 py-3.5 text-[#6B7280]">{m.email}</td>
                    <td className="px-5 py-3.5 font-mono text-[#6B7280]">{m.accountNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-medium text-navy">
                        {m.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280]">{m.preferredCurrency ?? 'USD'}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">
                      {formatCurrency(m.balance, m.preferredCurrency)}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B7280]">
                      {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add "app/admin/(protected)/dashboard/page.tsx"
git commit -m "feat: add admin members list page"
```

---

## Task 9: Admin dashboard — Create User

**Files:**
- Create: `app/admin/(protected)/dashboard/create-user/page.tsx`

- [ ] **Step 1: Create `app/admin/(protected)/dashboard/create-user/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CURRENCIES } from '@/lib/utils'

export default function CreateUserPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [accountType, setAccountType] = useState<'Savings' | 'Checking'>('Savings')
  const [preferredCurrency, setPreferredCurrency] = useState('USD')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, phone, accountType, preferredCurrency }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setSuccess(`Account created for ${data.data.fullName} (${data.data.accountNumber})`)
        setFullName(''); setEmail(''); setPassword(''); setPhone('')
        setAccountType('Savings'); setPreferredCurrency('USD')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Create Member</h1>
          <p className="text-sm text-[#6B7280]">Add a new member account</p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="Email" type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <Input label="Phone (Optional)" type="tel" placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Account Type</label>
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value as 'Savings' | 'Checking')}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            >
              <option value="Savings">Savings</option>
              <option value="Checking">Checking</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Preferred Currency</label>
            <select
              value={preferredCurrency}
              onChange={e => setPreferredCurrency(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full py-3">Create Account</Button>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add "app/admin/(protected)/dashboard/create-user/page.tsx"
git commit -m "feat: add admin create member page with currency selector"
```

---

## Task 10: Admin dashboard — Fund Account

**Files:**
- Create: `app/admin/(protected)/dashboard/fund/page.tsx`

- [ ] **Step 1: Create `app/admin/(protected)/dashboard/fund/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { Landmark } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface Member {
  id: string
  fullName: string
  accountNumber: string
  balance: number
  preferredCurrency?: string
}

export default function FundAccountPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [userId, setUserId] = useState('')
  const [type, setType] = useState<'credit' | 'debit'>('credit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.success) {
        setMembers(d.data)
        if (d.data.length > 0) setUserId(d.data[0].id)
      }
    })
  }, [])

  const selectedMember = members.find(m => m.id === userId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, amount: Number(amount), description }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        const newBal = formatCurrency(data.data.balanceAfter, selectedMember?.preferredCurrency)
        setSuccess(`${type === 'credit' ? 'Credit' : 'Debit'} applied. New balance: ${newBal}`)
        setAmount(''); setDescription('')
        setMembers(prev => prev.map(m =>
          m.id === userId ? { ...m, balance: data.data.balanceAfter } : m
        ))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <Landmark size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Fund Account</h1>
          <p className="text-sm text-[#6B7280]">Credit or debit a member's account</p>
        </div>
      </div>

      {selectedMember && (
        <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-5 py-4">
          <span className="text-sm text-[#6B7280]">Current Balance</span>
          <span className="text-lg font-bold text-navy">
            {formatCurrency(selectedMember.balance, selectedMember.preferredCurrency)}
          </span>
        </div>
      )}

      <Card className="p-6 space-y-5">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Member</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
              required
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName} — {m.accountNumber}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#1A1A2E]">Transaction Type</label>
            <div className="flex gap-2">
              {(['credit', 'debit'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors capitalize ${
                    type === t
                      ? t === 'credit'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:border-navy hover:text-navy'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. Monthly bonus"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <Button type="submit" loading={loading} className="w-full py-3">
            Apply {type === 'credit' ? 'Credit' : 'Debit'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/mac/Documents/mywebsite/banking && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Start dev server and verify all pages render**

```bash
cd /Users/mac/Documents/mywebsite/banking && npm run dev
```

Check each route:
- `http://localhost:3000/settings` → profile + password form
- `http://localhost:3000/admin/login` → admin login card
- `http://localhost:3000/admin/dashboard` → redirects to `/admin/login` (not logged in)
- Log in at `/admin/login` (requires `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars set)
- `http://localhost:3000/admin/dashboard` → members table
- `http://localhost:3000/admin/dashboard/create-user` → create form with currency dropdown
- `http://localhost:3000/admin/dashboard/fund` → fund form with member dropdown

- [ ] **Step 4: Final commit**

```bash
cd /Users/mac/Documents/mywebsite/banking
git add "app/admin/(protected)/dashboard/fund/page.tsx"
git commit -m "feat: add admin fund account page"
```
