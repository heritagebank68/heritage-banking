# Heritage Community Credit Union — Project Summary

## What It Is

A full-stack online banking web application built with **Next.js 14 App Router**. It simulates a real credit union portal with a complete user-facing dashboard and a separate admin management portal.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom navy `#001F45`) |
| Auth | JWT via `jose`, passwords via `bcryptjs` |
| Storage | Flat-file JSON (`data/*.json`) |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| Icons | lucide-react |

---

## Credentials

### User Portal
- URL: `http://localhost:3000/auth`
- Accounts managed via Admin portal (create/reset from `/admin/dashboard`)

### Admin Portal
- URL: `http://localhost:3000/admin/login`
- Username: `hccu_admin`
- Password: `Heritage@Admin2026`

---

## Project Structure

```
banking/
├── app/
│   ├── auth/                    # User login + forgot password
│   ├── dashboard/               # Main user dashboard
│   ├── deposit/                 # Deposit flow (direct, check, ATM)
│   ├── withdraw/                # Withdraw → contact support flow
│   ├── transfer/                # Transfer with PIN verification
│   ├── transactions/            # Transaction history with filters
│   ├── cards/                   # Virtual card viewer
│   ├── loans/                   # Loan application + status
│   ├── beneficiaries/           # Saved recipients
│   ├── notifications/           # Account alerts
│   ├── settings/                # Password & PIN management
│   ├── admin/
│   │   ├── login/               # Admin login page
│   │   └── (protected)/
│   │       └── dashboard/
│   │           ├── page.tsx         # Members overview + stats
│   │           ├── create-user/     # Create new member
│   │           ├── fund/            # Credit/debit member account
│   │           ├── transactions/    # All transactions + date edit
│   │           ├── loans/           # Loan applications management
│   │           └── members/[id]/    # Individual member detail
│   └── api/
│       ├── auth/                # Login + logout
│       ├── users/               # Profile, password, PIN
│       ├── deposit/             # Deposit endpoint
│       ├── withdraw/            # Withdraw endpoint
│       ├── transfer/            # Transfer endpoint
│       ├── transactions/        # Transaction history
│       ├── loans/               # User loan CRUD
│       ├── beneficiaries/       # Saved recipients CRUD
│       ├── notifications/       # Notification read/unread
│       └── admin/               # Admin-only endpoints
│           ├── login/logout
│           ├── users/[id]
│           ├── fund/
│           ├── transactions/[id]
│           └── loans/[id]
├── components/
│   ├── Sidebar.tsx              # User nav (10 items, mobile drawer)
│   ├── AdminSidebar.tsx         # Admin nav (5 items)
│   ├── BalanceCard.tsx          # Show/hide balance + copy account number
│   ├── SpendingAnalytics.tsx    # Pie + bar charts (Recharts)
│   ├── ExportStatement.tsx      # PDF statement export
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── lib/
│   ├── auth.ts                  # JWT sign/verify for user + admin
│   ├── db.ts                    # All flat-file read/write functions
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # formatCurrency, cn(), CURRENCIES
├── data/
│   ├── users.json
│   ├── transactions.json
│   ├── loans.json
│   ├── notifications.json
│   └── beneficiaries.json
└── middleware.ts                 # Route protection for user + admin
```

---

## User Portal Features

### Dashboard
- Balance card with **show/hide toggle** and copy account number
- Quick action buttons (Deposit, Withdraw, Transfer, Cards)
- Spending analytics (pie chart by category, bar chart by month)
- Recent transactions list
- PDF statement export

### Deposit
- Three deposit methods: Direct Bank Transfer, Check Deposit, ATM Deposit
- PIN verification step
- Confirmation screen → Contact Support (by design)
- Back button at top of each step

### Withdraw
- Amount entry → PIN verification → Contact Support flow
- Security-first design (no direct self-serve withdrawal)

### Transfer
- Recipient details (name, bank, account number)
- Amount + description
- PIN verification → goes directly to Contact Support
- Pre-fills form when navigating from a saved beneficiary

### Transactions
- Full transaction history grouped by date
- Search by description or category
- Filter by type (all / credit / debit)
- Date range picker

### Cards
- Virtual card display with masked number, expiry, CVV
- Show/hide CVV toggle
- Copy card number, expiry, CVV individually
- Card generated deterministically from account number

### Loans
- Apply for a loan (amount, purpose, duration)
- 8% annual interest rate — estimated monthly payment preview
- Duration options: 6, 12, 24, 36, 48, 60 months
- Active loan summary card
- Full loan history with status badges (pending / approved / rejected / active / paid)

### Beneficiaries
- Save recipients with name, bank, account number
- Avatar initials auto-generated
- Quick "Send Money" button pre-fills the transfer form
- Delete with confirmation modal

### Notifications
- All account alerts (credit, debit, info, alert types)
- Unread count badge
- Click to mark as read / Mark all as read
- Sent automatically on: deposits, transfers, loan status updates

### Settings
- Change password (requires current password)
- Set or change transaction PIN

### Auth
- Email + password login
- Forgot password modal → directs user to email or call support

---

## Admin Portal Features

### Dashboard (Members)
- Stats cards: Total Members, Total Balance, Total Credited, Total Debited
- Member search (by name, email, account number)
- Per-member actions: Edit profile, Reset password, Delete account, View detail
- Edit modal: fullName, email, phone, accountType, preferredCurrency
- Reset password modal with generated temporary password

### Member Detail
- Full profile card with balance
- Account info (number, type, currency, joined date)
- Mini stats (transaction count, total in, total out)
- Complete transaction history table

### Create Member
- Create new user accounts with full profile and initial balance

### Fund Account
- Credit or debit any member's account directly
- Automatically creates transaction record and sends notification to user

### Transactions
- All transactions across all members
- Search and type filter
- Edit transaction date functionality

### Loans Management
- All loan applications from all members
- Update loan status: pending → approved / rejected / active / paid
- Add admin note visible to the member
- Status change automatically sends notification to the user

---

## Data Models

```typescript
User         { id, fullName, email, password (hashed), pin (hashed), phone,
               accountNumber, accountType, preferredCurrency, createdAt }

Transaction  { id, userId, type, category, amount, description,
               balanceBefore, balanceAfter, createdAt }

Loan         { id, userId, amount, purpose, duration, monthlyPayment,
               status, adminNote?, createdAt, updatedAt }

Beneficiary  { id, userId, name, bank, accountNumber, createdAt }

Notification { id, userId, title, message,
               type: 'credit'|'debit'|'info'|'alert', read, createdAt }
```

---

## Security

- All user routes protected by middleware (JWT verification)
- All admin routes protected by separate admin JWT
- Passwords hashed with bcryptjs
- Transaction PINs hashed with bcryptjs
- Admin credentials stored in environment variables (never in code)
- HTTP-only cookies, secure in production
- No sensitive data exposed in client components

---

## Things Built / Fixed During Development

1. Fixed middleware admin redirect (`/admin` → `/admin/login`)
2. Fixed missing `/cards` route protection in middleware
3. Added admin authentication check to fund and user API routes
4. Transfer page: PIN step skips confirmation, goes straight to Contact Support
5. Transfer page: pre-fills form from beneficiary query params
6. Moved all "Back" buttons to the top of each step (deposit + transfer)
7. Dashboard balance: added show/hide toggle via `BalanceCard` client component
8. Built spending analytics with Recharts (pie + bar)
9. Built PDF statement export with jsPDF
10. Built complete notifications system with auto-send on key events
11. Built loans system with admin approval workflow
12. Built beneficiaries with quick-send to transfer
13. Built full admin member management (view, edit, delete, reset password)
14. Built admin loan management with status updates + notifications
15. Built admin transaction search/filter
16. Added forgot password flow (contact support modal)
17. Updated sidebar with all new routes
18. Updated middleware to protect all new routes
