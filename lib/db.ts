import { neon } from '@neondatabase/serverless'
import type { User, Transaction, Notification, Loan, Beneficiary } from './types'

function sql() {
  return neon(process.env.POSTGRES_URL!)
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const db = sql()
  const rows = await db`
    SELECT id, full_name AS "fullName", email, password, pin, phone,
           account_number AS "accountNumber", account_type AS "accountType",
           preferred_currency AS "preferredCurrency", created_at AS "createdAt"
    FROM users ORDER BY created_at DESC
  `
  return rows as User[]
}

export async function getUserById(id: string): Promise<User | null> {
  const db = sql()
  const rows = await db`
    SELECT id, full_name AS "fullName", email, password, pin, phone,
           account_number AS "accountNumber", account_type AS "accountType",
           preferred_currency AS "preferredCurrency", created_at AS "createdAt"
    FROM users WHERE id = ${id} LIMIT 1
  `
  return (rows[0] as User) ?? null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = sql()
  const rows = await db`
    SELECT id, full_name AS "fullName", email, password, pin, phone,
           account_number AS "accountNumber", account_type AS "accountType",
           preferred_currency AS "preferredCurrency", created_at AS "createdAt"
    FROM users WHERE email = ${email} LIMIT 1
  `
  return (rows[0] as User) ?? null
}

export async function createUser(user: User): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO users (id, full_name, email, password, pin, phone, account_number, account_type, preferred_currency, created_at)
    VALUES (${user.id}, ${user.fullName}, ${user.email}, ${user.password},
            ${user.pin ?? null}, ${user.phone ?? null}, ${user.accountNumber},
            ${user.accountType ?? 'savings'}, ${user.preferredCurrency ?? 'USD'}, ${user.createdAt})
  `
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
  const db = sql()
  if (updates.fullName   !== undefined) await db`UPDATE users SET full_name         = ${updates.fullName}          WHERE id = ${id}`
  if (updates.email      !== undefined) await db`UPDATE users SET email             = ${updates.email}             WHERE id = ${id}`
  if (updates.phone      !== undefined) await db`UPDATE users SET phone             = ${updates.phone}             WHERE id = ${id}`
  if (updates.accountType !== undefined) await db`UPDATE users SET account_type     = ${updates.accountType}       WHERE id = ${id}`
  if (updates.preferredCurrency !== undefined) await db`UPDATE users SET preferred_currency = ${updates.preferredCurrency} WHERE id = ${id}`
  if (updates.password   !== undefined) await db`UPDATE users SET password          = ${updates.password}          WHERE id = ${id}`
  if (updates.pin        !== undefined) await db`UPDATE users SET pin               = ${updates.pin}               WHERE id = ${id}`
}

export async function deleteUser(id: string): Promise<void> {
  const db = sql()
  await db`DELETE FROM users WHERE id = ${id}`
}

export async function updateUserPassword(id: string, hash: string): Promise<void> {
  await updateUser(id, { password: hash })
}

export async function updateUserPin(id: string, pinHash: string): Promise<void> {
  await updateUser(id, { pin: pinHash })
}

// ── Transactions ───────────────────────────────────────────────────────────

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const db = sql()
  const rows = await db`
    SELECT id, user_id AS "userId", type, category, amount, description,
           balance_before AS "balanceBefore", balance_after AS "balanceAfter",
           created_at AS "createdAt"
    FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rows as Transaction[]
}

export async function getAllTransactions(): Promise<(Transaction & { userFullName: string; userAccountNumber: string })[]> {
  const db = sql()
  const rows = await db`
    SELECT t.id, t.user_id AS "userId", t.type, t.category, t.amount, t.description,
           t.balance_before AS "balanceBefore", t.balance_after AS "balanceAfter",
           t.created_at AS "createdAt",
           u.full_name AS "userFullName", u.account_number AS "userAccountNumber"
    FROM transactions t JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `
  return rows as (Transaction & { userFullName: string; userAccountNumber: string })[]
}

export async function createTransaction(tx: Transaction): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO transactions (id, user_id, type, category, amount, description, balance_before, balance_after, created_at)
    VALUES (${tx.id}, ${tx.userId}, ${tx.type}, ${tx.category}, ${tx.amount},
            ${tx.description ?? null}, ${tx.balanceBefore}, ${tx.balanceAfter}, ${tx.createdAt})
  `
}

export async function updateTransactionDate(id: string, newDate: string): Promise<void> {
  const db = sql()
  await db`UPDATE transactions SET created_at = ${newDate} WHERE id = ${id}`
}

export async function getUserBalance(userId: string): Promise<number> {
  const db = sql()
  const rows = await db`
    SELECT COALESCE(
      SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0
    ) AS balance
    FROM transactions WHERE user_id = ${userId}
  `
  return Number(rows[0]?.balance ?? 0)
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const db = sql()
  const rows = await db`
    SELECT id, user_id AS "userId", title, message, type, read, created_at AS "createdAt"
    FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rows as Notification[]
}

export async function createNotification(n: Notification): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
    VALUES (${n.id}, ${n.userId}, ${n.title}, ${n.message}, ${n.type}, ${n.read}, ${n.createdAt})
  `
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = sql()
  await db`UPDATE notifications SET read = TRUE WHERE id = ${id}`
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = sql()
  await db`UPDATE notifications SET read = TRUE WHERE user_id = ${userId}`
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = sql()
  const rows = await db`SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${userId} AND read = FALSE`
  return Number(rows[0]?.count ?? 0)
}

// ── Loans ──────────────────────────────────────────────────────────────────

export async function getUserLoans(userId: string): Promise<Loan[]> {
  const db = sql()
  const rows = await db`
    SELECT id, user_id AS "userId", amount, purpose, duration,
           monthly_payment AS "monthlyPayment", status, admin_note AS "adminNote",
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM loans WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rows as Loan[]
}

export async function getAllLoans(): Promise<(Loan & { userFullName: string; userEmail: string; userAccountNumber: string })[]> {
  const db = sql()
  const rows = await db`
    SELECT l.id, l.user_id AS "userId", l.amount, l.purpose, l.duration,
           l.monthly_payment AS "monthlyPayment", l.status, l.admin_note AS "adminNote",
           l.created_at AS "createdAt", l.updated_at AS "updatedAt",
           u.full_name AS "userFullName", u.email AS "userEmail", u.account_number AS "userAccountNumber"
    FROM loans l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC
  `
  return rows as (Loan & { userFullName: string; userEmail: string; userAccountNumber: string })[]
}

export async function createLoan(loan: Loan): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO loans (id, user_id, amount, purpose, duration, monthly_payment, status, admin_note, created_at, updated_at)
    VALUES (${loan.id}, ${loan.userId}, ${loan.amount}, ${loan.purpose}, ${loan.duration},
            ${loan.monthlyPayment}, ${loan.status}, ${loan.adminNote ?? null}, ${loan.createdAt}, ${loan.updatedAt})
  `
}

export async function updateLoan(id: string, updates: Partial<Loan>): Promise<void> {
  const db = sql()
  const now = new Date().toISOString()
  if (updates.status    !== undefined) await db`UPDATE loans SET status     = ${updates.status},     updated_at = ${now} WHERE id = ${id}`
  if (updates.adminNote !== undefined) await db`UPDATE loans SET admin_note = ${updates.adminNote},  updated_at = ${now} WHERE id = ${id}`
}

// ── Beneficiaries ──────────────────────────────────────────────────────────

export async function getUserBeneficiaries(userId: string): Promise<Beneficiary[]> {
  const db = sql()
  const rows = await db`
    SELECT id, user_id AS "userId", name, bank, account_number AS "accountNumber", created_at AS "createdAt"
    FROM beneficiaries WHERE user_id = ${userId} ORDER BY name ASC
  `
  return rows as Beneficiary[]
}

export async function createBeneficiary(b: Beneficiary): Promise<void> {
  const db = sql()
  await db`
    INSERT INTO beneficiaries (id, user_id, name, bank, account_number, created_at)
    VALUES (${b.id}, ${b.userId}, ${b.name}, ${b.bank}, ${b.accountNumber}, ${b.createdAt})
  `
}

export async function deleteBeneficiary(id: string, userId: string): Promise<void> {
  const db = sql()
  await db`DELETE FROM beneficiaries WHERE id = ${id} AND user_id = ${userId}`
}
