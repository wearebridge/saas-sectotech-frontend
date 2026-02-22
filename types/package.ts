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

export interface SubscriptionInfo {
  subscriptionId: string;
  status: string;
  planName: string;
  credits: number | null;
  interval: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  unitAmount: number | null;
  currency: string | null;
}
