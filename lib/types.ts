export interface User {
  id: string
  fullName: string
  email: string
  password: string
  pin?: string
  phone: string
  accountNumber: string
  accountType: 'Savings' | 'Checking'
  preferredCurrency?: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: 'credit' | 'debit'
  category: 'Transfer' | 'Deposit' | 'Withdrawal' | 'Admin Credit' | 'Admin Debit'
  amount: number
  description: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'credit' | 'debit' | 'info' | 'alert'
  read: boolean
  createdAt: string
}

export interface Loan {
  id: string
  userId: string
  amount: number
  purpose: string
  duration: number
  monthlyPayment: number
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid'
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export interface Beneficiary {
  id: string
  userId: string
  name: string
  bank: string
  accountNumber: string
  createdAt: string
}
