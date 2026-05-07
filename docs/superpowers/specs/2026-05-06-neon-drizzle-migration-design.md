# Neon + Drizzle Database Migration — Design Spec
Date: 2026-05-06

## Overview

Migrate the data layer from local JSON files (`data/users.json`, `data/transactions.json`) to a Neon Postgres database using Drizzle ORM. This is required for Vercel deployment since Vercel's serverless filesystem is read-only.

No UI changes. No auth changes. Only the data access layer changes.

---

## Approach

**Drizzle ORM + `@neondatabase/serverless`** — Neon's serverless driver uses WebSockets (not TCP), designed for Vercel/Edge serverless environments. Zero cold-start connection overhead. Fully typed via Drizzle schema.

---

## New Dependencies

```
drizzle-orm
@neondatabase/serverless
drizzle-kit (devDependency — for schema migrations)
```

---

## File Changes

| Action | File | What changes |
|--------|------|-------------|
| Create | `lib/schema.ts` | Drizzle table definitions for `users` and `transactions` |
| Replace | `lib/db.ts` | Exports Drizzle client instead of JSON file helpers |
| Modify | `app/api/auth/route.ts` | Use Drizzle queries |
| Modify | `app/api/admin/users/route.ts` | Use Drizzle queries |
| Modify | `app/api/admin/fund/route.ts` | Use Drizzle queries |
| Modify | `app/api/deposit/route.ts` | Use Drizzle queries |
| Modify | `app/api/withdraw/route.ts` | Use Drizzle queries |
| Modify | `app/api/transfer/route.ts` | Use Drizzle queries |
| Modify | `app/api/transactions/route.ts` | Use Drizzle queries |
| Modify | `app/api/users/me/route.ts` | Use Drizzle queries |
| Modify | `app/api/users/password/route.ts` | Use Drizzle queries |
| Modify | `app/dashboard/page.tsx` | Use Drizzle queries (server component) |
| Modify | `app/transactions/page.tsx` | Use Drizzle queries (server component) |
| Modify | `app/settings/page.tsx` | Use Drizzle queries (server component) |
| Modify | `app/admin/(protected)/dashboard/page.tsx` | Use Drizzle queries (server component) |
| Create | `drizzle.config.ts` | Drizzle Kit config for migrations |
| Create | `lib/migrate.ts` | One-time migration runner (creates tables) |
| Delete | `data/users.json` | No longer needed |
| Delete | `data/transactions.json` | No longer needed |

---

## Schema

### `users` table

```typescript
id: text (primary key, UUID)
fullName: text (not null)
email: text (not null, unique)
password: text (not null)
phone: text (not null, default '')
accountNumber: text (not null, unique)
accountType: text (not null) -- 'Savings' | 'Checking'
preferredCurrency: text (not null, default 'USD')
createdAt: text (not null) -- ISO string
```

### `transactions` table

```typescript
id: text (primary key, UUID)
userId: text (not null, references users.id)
type: text (not null) -- 'credit' | 'debit'
category: text (not null) -- 'Transfer' | 'Deposit' | 'Withdrawal' | 'Admin Credit' | 'Admin Debit'
amount: numeric (not null)
description: text (not null)
balanceBefore: numeric (not null)
balanceAfter: numeric (not null)
createdAt: text (not null) -- ISO string
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (from Neon dashboard) |
| `JWT_SECRET` | Already exists |
| `ADMIN_USERNAME` | Already exists |
| `ADMIN_PASSWORD` | Already exists |

---

## Data Flow

```
Request → API route → Drizzle query → Neon Postgres (via WebSocket)
                                    ↓
                              Result (typed row)
```

The `lib/db.ts` file exports a single `db` object and the table references. All routes import `{ db }` and `{ users, transactions }` from `@/lib/db`.

The `lib/balance.ts` `getUserBalance()` function stays unchanged — it receives transactions array and computes balance in memory.

---

## Migration Strategy

Run `drizzle-kit push` once to create tables in Neon before first deploy. No seed data needed — admin creates users via the admin dashboard.

---

## Out of Scope

- Data migration from JSON files (users.json is currently empty)
- Connection pooling configuration (Neon serverless handles this)
- Row-level security or Postgres roles
