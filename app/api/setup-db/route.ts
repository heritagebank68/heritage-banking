import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(req: NextRequest) {
  // Protect with admin password so random people can't call this
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sql = neon(process.env.POSTGRES_URL!)
    const log: string[] = []

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
    // Add pin column if it doesn't exist (for existing databases)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pin TEXT`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'savings'`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD'`
    log.push('✅ users')

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
    log.push('✅ transactions')

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
    log.push('✅ notifications')

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
    log.push('✅ loans')

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
    log.push('✅ beneficiaries')

    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user_id  ON transactions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_loans_user_id         ON loans(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id)`
    log.push('✅ indexes')

    return NextResponse.json({ success: true, message: 'Database setup complete!', log })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
