export interface User {
  id: string
  fullName: string
  email: string
  password: string
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
