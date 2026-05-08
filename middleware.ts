import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

const USER_PROTECTED = ['/dashboard', '/deposit', '/withdraw', '/transfer', '/transactions', '/settings', '/cards', '/notifications', '/loans', '/beneficiaries']
const ADMIN_PROTECTED = ['/admin/dashboard']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (ADMIN_PROTECTED.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('hccu_admin')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    try {
      await jwtVerify(token, getSecret())
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (USER_PROTECTED.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('hccu_session')?.value
    if (!token) return NextResponse.redirect(new URL('/auth', req.url))
    try {
      await jwtVerify(token, getSecret())
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deposit/:path*',
    '/withdraw/:path*',
    '/transfer/:path*',
    '/transactions/:path*',
    '/settings/:path*',
    '/cards/:path*',
    '/notifications/:path*',
    '/loans/:path*',
    '/beneficiaries/:path*',
    '/admin/dashboard/:path*',
  ],
}
