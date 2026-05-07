import { NextResponse } from 'next/server'
import { USER_COOKIE } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(USER_COOKIE)
  return res
}
