import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'
import { updateTransactionDate } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyAdminToken(token)

    const { date } = await req.json()
    if (!date) return NextResponse.json({ success: false, message: 'Date is required' }, { status: 400 })

    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date' }, { status: 400 })
    }

    await updateTransactionDate(params.id, parsed.toISOString())
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
