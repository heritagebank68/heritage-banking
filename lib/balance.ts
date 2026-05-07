import type { Transaction } from './types'

export function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount
  }, 0)
}

export function getUserBalance(userId: string, transactions: Transaction[]): number {
  return computeBalance(transactions.filter(tx => tx.userId === userId))
}
