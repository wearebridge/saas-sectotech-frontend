export interface CreditTransaction {
  id: string
  amount: number
  stripeSessionId?: string
  purchasedBy?: string
  purchasedByName?: string
  createdAt: string
  expiresAt?: string
  remainingAmount?: number
  sourceType?: string
  intervalType?: string
}
