export interface StripeProduct {
  productId: string;
  priceId: string;
  name: string;
  description?: string;
  unitAmount: number;    // price in cents (e.g., 10000 = R$ 100,00)
  currency: string;
  type: 'recurring' | 'one_time';
  interval?: string;     // "month", "year", etc.
  credits: number;
}
