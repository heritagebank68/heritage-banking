# Admin Dashboard & Settings — Design Spec
Date: 2026-05-06

## Overview

Complete three missing sections of the Heritage Community Credit Union Next.js app:
1. **Settings page** — profile view + password change for logged-in users
2. **Admin login page** — separate entry point for administrators
3. **Admin dashboard** — sidebar layout with three sub-pages (users list, create user, fund account)

All backend APIs already exist. This spec covers UI only, plus a `preferredCurrency` field addition to the `User` type and `users.json` data schema.

---

## Architecture

### Routing

```
app/
├── admin/
│   ├── login/page.tsx          ← Admin login
│   ├── layout.tsx              ← Auth guard + AdminSidebar
│   └── dashboard/
│       ├── page.tsx            ← Users list
│       ├── create-user/page.tsx
│       └── fund/page.tsx
├── settings/
│   └── page.tsx
components/
└── AdminSidebar.tsx
```

### Currency Preference

Each user has a `preferredCurrency` field (ISO 4217 code, e.g. `"USD"`, `"EUR"`, `"GBP"`). This is **display-only** — no conversion happens. Every amount shown to a user (balance, transactions, fund confirmations) is formatted using their `preferredCurrency` code with `Intl.NumberFormat`. A shared `formatCurrency(amount, currency)` utility in `lib/utils.ts` handles this.

A broad list of supported currencies is offered at create time (at minimum: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, NGN, INR, BRL, ZAR, MXN, SGD, AED).

### Auth Guard

`app/admin/layout.tsx` is a server component. It reads the admin cookie, calls `verifyAdminToken` from `@/lib/auth`, and redirects to `/admin/login` if the token is missing or invalid. All child pages inherit this protection automatically.

---

## Components

### AdminSidebar

- Fixed left, 256px wide, same `#001F45` navy background as `Sidebar.tsx`
- Logo + "Admin Portal" label at top
- Nav items: Users (`/admin/dashboard`), Create User (`/admin/dashboard/create-user`), Fund Account (`/admin/dashboard/fund`)
- Logout button at bottom — calls `POST /api/admin/logout`, redirects to `/admin/login`
- Active link highlighted with `bg-navy`

---

## Pages

### Admin Login (`/admin/login`)

- Same card layout as `/auth`
- Heading: "Admin Portal" with a shield or lock icon
- Fields: Username, Password
- Posts to `POST /api/admin/login`
- On success: redirects to `/admin/dashboard`
- On failure: shows inline error message
- Back link to `/` (home)

### Users List (`/admin/dashboard`)

- Server component — fetches `GET /api/admin/users` at render time
- Table columns: Full Name, Email, Account Number, Account Type, Preferred Currency, Balance, Joined
- Balance formatted using each user's `preferredCurrency`
- Empty state: "No users found."
- Heading: "Members" with total count badge

### Create User (`/admin/dashboard/create-user`)

- Client component form
- Fields: Full Name (required), Email (required), Password (required, min 8 chars), Phone (optional), Account Type (Savings/Checking select, default Savings), Preferred Currency (select from supported list, default USD)
- Posts to `POST /api/admin/users`
- On success: shows success message, clears form
- On error: shows inline error

### Fund Account (`/admin/dashboard/fund`)

- Client component form
- Fetches user list on mount (`GET /api/admin/users`) to populate dropdown
- Fields: User (select dropdown showing name + account number), Type (Credit / Debit toggle buttons), Amount (positive number, required), Description (optional)
- Posts to `POST /api/admin/fund`
- On success: shows success message with new balance formatted in the selected user's `preferredCurrency`
- On error: shows inline error (e.g. insufficient funds for debit)

### Settings (`/settings`)

- Server component for profile section, client component for password form
- **Profile section** (read-only card):
  - Full Name, Email, Phone, Account Number, Account Type, Preferred Currency
  - Small note: "Contact your branch to update profile information"
- **Change Password section**:
  - Fields: Current Password, New Password (min 8 chars), Confirm New Password
  - Client-side validation: new password === confirm password before submitting
  - Patches `PATCH /api/users/password`
  - On success: success message, form cleared
  - On error: inline error

---

## Styling

- Follow existing patterns: `bg-[#F4F6F9]` page background, `bg-white border border-[#E5E7EB]` cards, `text-navy` / `bg-navy` for primary actions
- Use existing `Input`, `Button`, `Card` components from `@/components/ui/`
- Admin pages use `AdminSidebar` with `ml-64` main content offset — mirrors user dashboard layout exactly

---

## Data Flow

```
Admin login → POST /api/admin/login → sets admin cookie → redirect /admin/dashboard
Admin layout → verifyAdminToken(cookie) → renders children or redirect /admin/login
Users list → GET /api/admin/users → renders table
Create user → POST /api/admin/users → success/error feedback
Fund account → GET /api/admin/users (populate dropdown) + POST /api/admin/fund
Settings profile → GET /api/users/me → read-only display
Settings password → PATCH /api/users/password → success/error feedback
```

---

## Error Handling

- All forms show inline error banners (red) and success banners (green) — consistent with existing pages
- Auth errors redirect to the appropriate login page
- Network/server errors show "Something went wrong. Please try again."

---

## Data Schema Change

Add `preferredCurrency: string` to the `User` interface in `lib/types.ts`. Existing users in `data/users.json` default to `"USD"`. The `POST /api/admin/users` route already accepts arbitrary fields — pass `preferredCurrency` through and save it.

---

## Out of Scope

- Editing user profile info after account creation (including currency change)
- Admin ability to delete users
- Pagination on the users table
- Currency conversion / exchange rates
