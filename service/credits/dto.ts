import { tokenProps } from "@/types/token";

export interface BuyCreditsProps extends tokenProps {
  priceId: string;
}

export interface VerifyPaymentProps extends tokenProps {
  sessionId: string;
}
