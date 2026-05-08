/**
 * Run once after connecting Vercel Postgres to create all tables and seed the admin account.
 * Usage: npx tsx scripts/setup-db.ts
 */

import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

async function main() {
  const url = process.env.POSTGRES_URL
  if (!url) {
    console.error('❌  POSTGRES_URL is not set. Add it to .env.local and try again.')
    process.exit(1)
  }

  const sql = neon(url)
  console.log('🔌  Connected to Postgres. Creating tables…')

  // ── Tables ─────────────────────────────────────────────────────────────────

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                 TEXT        PRIMARY KEY,
      full_name          TEXT        NOT NULL,
      email              TEXT        UNIQUE NOT NULL,
      password           TEXT        NOT NULL,
      pin                TEXT,
      phone              TEXT,
      account_number     TEXT        UNIQUE NOT NULL,
      account_type       TEXT        NOT NULL DEFAULT 'savings',
      preferred_currency TEXT        NOT NULL DEFAULT 'USD',
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✅  users')

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id             TEXT        PRIMARY KEY,
      user_id        TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type           TEXT        NOT NULL,
      category       TEXT        NOT NULL,
      amount         NUMERIC     NOT NULL,
      description    TEXT,
      balance_before NUMERIC     NOT NULL,
      balance_after  NUMERIC     NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✅  transactions')

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT        PRIMARY KEY,
      user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT        NOT NULL,
      message    TEXT        NOT NULL,
      type       TEXT        NOT NULL DEFAULT 'info',
      read       BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✅  notifications')

  await sql`
    CREATE TABLE IF NOT EXISTS loans (
      id              TEXT        PRIMARY KEY,
      user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount          NUMERIC     NOT NULL,
      purpose         TEXT        NOT NULL,
      duration        INTEGER     NOT NULL,
      monthly_payment NUMERIC     NOT NULL,
      status          TEXT        NOT NULL DEFAULT 'pending',
      admin_note      TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✅  loans')

  await sql`
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id             TEXT        PRIMARY KEY,
      user_id        TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name           TEXT        NOT NULL,
      bank           TEXT        NOT NULL,
      account_number TEXT        NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✅  beneficiaries')

  // ── Indexes ────────────────────────────────────────────────────────────────

  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id   ON transactions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON notifications(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_loans_user_id          ON loans(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id  ON beneficiaries(user_id)`
  console.log('  ✅  indexes')

  // ── Seed demo user ─────────────────────────────────────────────────────────

  const existing = await sql`SELECT id FROM users LIMIT 1`
  if (existing.length > 0) {
    console.log('\n⚠️   Users table already has data — skipping seed.')
  } else {
    const userId        = uuid()
    const accountNumber = '1000000001'
    const passwordHash  = await bcrypt.hash('Demo@1234', 10)
    const now           = new Date().toISOString()

    await sql`
      INSERT INTO users (id, full_name, email, password, phone, account_number, account_type, preferred_currency, created_at)
      VALUES (${userId}, 'Demo User', 'demo@heritageccu.com', ${passwordHash},
              '+1 555 000 0001', ${accountNumber}, 'savings', 'USD', ${now})
    `

    const txId = uuid()
    await sql`
      INSERT INTO transactions (id, user_id, type, category, amount, description, balance_before, balance_after, created_at)
      VALUES (${txId}, ${userId}, 'credit', 'Deposit', 5000, 'Welcome bonus', 0, 5000, ${now})
    `

    const notifId = uuid()
    await sql`
      INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
      VALUES (${notifId}, ${userId}, 'Welcome to Heritage CU!',
              'Your account has been created. Your opening balance of $5,000 has been credited.',
              'info', false, ${now})
    `

    console.log('\n🌱  Demo user seeded:')
    console.log('     Email:    demo@heritageccu.com')
    console.log('     Password: Demo@1234')
    console.log('     Balance:  $5,000')
  }

  console.log('\n🎉  Database setup complete! You can now deploy to Vercel.')
}

main().catch(err => {
  console.error('❌  Setup failed:', err)
  process.exit(1)
})
