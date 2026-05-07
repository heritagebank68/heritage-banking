import { sql } from '@vercel/postgres'
import type { User, Transaction } from './types'

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      account_number TEXT UNIQUE NOT NULL,
      account_type TEXT DEFAULT 'Savings',
      preferred_currency TEXT DEFAULT 'USD',
      created_at TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      description TEXT DEFAULT '',
      balance_before NUMERIC NOT NULL,
      balance_after NUMERIC NOT NULL,
      created_at TEXT NOT NULL
    )
  `
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    password: row.password as string,
    phone: (row.phone as string) || '',
    accountNumber: row.account_number as string,
    accountType: row.account_type as 'Savings' | 'Checking',
    preferredCurrency: (row.preferred_currency as string) || 'USD',
    createdAt: row.created_at as string,
  }
}

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as 'credit' | 'debit',
    category: row.category as Transaction['category'],
    amount: Number(row.amount),
    description: (row.description as string) || '',
    balanceBefore: Number(row.balance_before),
    balanceAfter: Number(row.balance_after),
    createdAt: row.created_at as string,
  }
}

export async function getAllUsers(): Promise<User[]> {
  await ensureSchema()
  const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`
  return rows.map(rowToUser)
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureSchema()
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`
  return rows.length ? rowToUser(rows[0]) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await ensureSchema()
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
  return rows.length ? rowToUser(rows[0]) : null
}

export async function createUser(user: User): Promise<void> {
  await ensureSchema()
  await sql`
    INSERT INTO users (id, full_name, email, password, phone, account_number, account_type, preferred_currency, created_at)
    VALUES (${user.id}, ${user.fullName}, ${user.email}, ${user.password}, ${user.phone}, ${user.accountNumber}, ${user.accountType}, ${user.preferredCurrency || 'USD'}, ${user.createdAt})
  `
}

export async function updateUserPassword(id: string, hash: string): Promise<void> {
  await sql`UPDATE users SET password = ${hash} WHERE id = ${id}`
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  await ensureSchema()
  const { rows } = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return rows.map(rowToTransaction)
}

export async function getAllTransactions(): Promise<Transaction[]> {
  await ensureSchema()
  const { rows } = await sql`SELECT * FROM transactions ORDER BY created_at DESC`
  return rows.map(rowToTransaction)
}

export async function createTransaction(tx: Transaction): Promise<void> {
  await ensureSchema()
  await sql`
    INSERT INTO transactions (id, user_id, type, category, amount, description, balance_before, balance_after, created_at)
    VALUES (${tx.id}, ${tx.userId}, ${tx.type}, ${tx.category}, ${tx.amount}, ${tx.description}, ${tx.balanceBefore}, ${tx.balanceAfter}, ${tx.createdAt})
  `
}

export async function getUserBalance(userId: string): Promise<number> {
  await ensureSchema()
  const { rows } = await sql`
    SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions WHERE user_id = ${userId}
  `
  return Number(rows[0]?.balance ?? 0)
}
