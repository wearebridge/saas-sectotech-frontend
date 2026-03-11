import { CreditTransaction } from "@/types/credit-transaction";

export interface DashboardResponse {
  creditTransactions: CreditTransaction[];
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  currentCreditBalance: number;
  totalUsers: number;
  totalClients: number;
  totalScripts: number;
  totalAnalysesInPeriod: number;
  month: number;
  year: number;
}
