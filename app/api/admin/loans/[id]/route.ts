import { NextRequest, NextResponse } from 'next/server'
import { updateLoan, getUserById, createNotification } from '@/lib/db'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    await verifyAdminToken(token)

    const { status, adminNote, userId } = await req.json()
    if (!['approved', 'rejected', 'active', 'paid'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 })
    }

    await updateLoan(params.id, { status, adminNote, updatedAt: new Date().toISOString() })

    if (userId) {
      const user = await getUserById(userId)
      const messages: Record<string, string> = {
        approved: 'Your loan application has been approved! Our team will be in touch shortly.',
        rejected: `Your loan application was not approved.${adminNote ? ` Reason: ${adminNote}` : ''}`,
        active:   'Your loan is now active. Please ensure timely monthly payments.',
        paid:     'Congratulations! Your loan has been fully paid off.',
      }
      await createNotification({
        id: uuidv4(),
        userId,
        title: `Loan ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: messages[status] ?? '',
        type: status === 'approved' || status === 'active' ? 'info' : status === 'rejected' ? 'alert' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
      })
      void user
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
