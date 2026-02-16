export interface CreditTransaction {
  id: string
  amount: number
  stripeSessionId?: string
  purchasedBy?: string
  purchasedByName?: string
  createdAt: string
}
