export interface CreditPackage {
  id: string
  name: string
  identifier: string
  priceInCents: number
  credits: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}
