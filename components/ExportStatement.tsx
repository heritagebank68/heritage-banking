'use client'
import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface Props {
  transactions: Transaction[]
  user: { fullName: string; accountNumber: string; accountType: string; email: string }
  balance: number
  currency: string
}

export default function ExportStatement({ transactions, user, balance, currency }: Props) {
  const [open, setOpen] = useState(false)

  // ── CSV ──
  function downloadCSV() {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Balance After']
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleString('en-US'),
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      tx.type,
      tx.type === 'debit' ? -tx.amount : tx.amount,
      tx.balanceAfter,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `heritage-statement-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  // ── PDF ──
  async function downloadPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()

    // ── Header banner ──
    doc.setFillColor(0, 31, 69)        // navy #001F45
    doc.rect(0, 0, pageW, 32, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Heritage Community Credit Union', 14, 13)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Account Statement', 14, 21)
    doc.setFontSize(8)
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 28)

    // ── Account info block ──
    doc.setTextColor(26, 26, 46)       // #1A1A2E
    doc.setFillColor(249, 250, 251)    // #F9FAFB
    doc.roundedRect(14, 38, pageW - 28, 32, 2, 2, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Account Holder',  18, 46)
    doc.text('Account Number',  18, 53)
    doc.text('Account Type',    18, 60)

    doc.setFont('helvetica', 'normal')
    doc.text(user.fullName,        60, 46)
    doc.text(user.accountNumber,   60, 53)
    doc.text(user.accountType,     60, 60)

    // right column
    doc.setFont('helvetica', 'bold')
    doc.text('Current Balance', pageW / 2 + 4, 46)
    doc.text('Currency',        pageW / 2 + 4, 53)
    doc.text('Transactions',    pageW / 2 + 4, 60)

    doc.setFont('helvetica', 'normal')
    doc.text(formatCurrency(balance, currency), pageW / 2 + 36, 46)
    doc.text(currency,                          pageW / 2 + 36, 53)
    doc.text(String(transactions.length),       pageW / 2 + 36, 60)

    // ── Summary row ──
    const totalIn  = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
    const totalOut = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

    doc.setFillColor(0, 31, 69)
    doc.roundedRect(14, 74, pageW - 28, 14, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total In: ${formatCurrency(totalIn, currency)}`,   18,  83)
    doc.text(`Total Out: ${formatCurrency(totalOut, currency)}`, pageW / 2 - 10, 83)
    doc.text(`Net: ${formatCurrency(totalIn - totalOut, currency)}`, pageW - 50, 83)

    // ── Transaction table ──
    doc.setTextColor(26, 26, 46)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Transaction History', 14, 98)

    autoTable(doc, {
      startY: 102,
      head: [['Date & Time', 'Description', 'Category', 'Type', 'Amount', 'Balance']],
      body: transactions.map(tx => [
        new Date(tx.createdAt).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        tx.description || '—',
        tx.category,
        tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
        (tx.type === 'debit' ? '-' : '+') + formatCurrency(tx.amount, currency),
        formatCurrency(tx.balanceAfter, currency),
      ]),
      headStyles: {
        fillColor: [0, 45, 98],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: [26, 26, 46] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 32 },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 3) {
          const val = String(data.cell.raw ?? '')
          data.cell.styles.textColor = val === 'Credit'
            ? [22, 163, 74]
            : [220, 38, 38]
        }
        if (data.section === 'body' && data.column.index === 4) {
          const val = String(data.cell.raw ?? '')
          data.cell.styles.textColor = val.startsWith('+')
            ? [22, 163, 74]
            : [220, 38, 38]
        }
      },
      margin: { left: 14, right: 14 },
    })

    // ── Footer on every page ──
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } })
      .internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'Heritage Community Credit Union — Confidential. For account holder use only.',
        14, doc.internal.pageSize.getHeight() - 6,
      )
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageW - 14, doc.internal.pageSize.getHeight() - 6,
        { align: 'right' },
      )
    }

    doc.save(`heritage-statement-${Date.now()}.pdf`)
    setOpen(false)
  }

  if (transactions.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:border-navy hover:text-navy transition-colors shadow-sm"
      >
        <Download size={15} />
        Export
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-48 rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
            <button
              onClick={downloadPDF}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#1A1A2E] hover:bg-[#F9FAFB] transition-colors"
            >
              <FileText size={16} className="text-red-500" />
              <div className="text-left">
                <p className="font-medium">Download PDF</p>
                <p className="text-xs text-[#9CA3AF]">Bank statement format</p>
              </div>
            </button>
            <div className="border-t border-[#F3F4F6]" />
            <button
              onClick={downloadCSV}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#1A1A2E] hover:bg-[#F9FAFB] transition-colors"
            >
              <FileSpreadsheet size={16} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium">Download CSV</p>
                <p className="text-xs text-[#9CA3AF]">Open in Excel / Sheets</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
