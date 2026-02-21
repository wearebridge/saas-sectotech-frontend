"use server";

import { CustomError } from "@/lib/errors/custom-errors";
import { BuyCreditsProps, VerifyPaymentProps, GetTransactionHistoryProps } from "./dto";
import * as api from "@/service/api";
import { tokenProps } from "@/types/token";
import { StripeProduct } from "@/types/package";
import { CreditTransaction } from "@/types/credit-transaction";

export async function buyCredits({
  priceId,
  token,
}: BuyCreditsProps): Promise<CustomError | string> {
  try {
    if (!token || !priceId) {
      return new CustomError(
        "BAD_REQUEST",
        "Token ou ID do preço não fornecido.",
      );
    }

    const response = await api.POST(
      "/payment/checkout",
      { priceId: priceId },
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao processar a compra de créditos.",
      );
    }

    const { url } = await response.json();

    return url;
  } catch (error) {
    console.error("Error buying credits:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Ocorreu um erro ao processar a compra de créditos.",
    );
  }
}

export async function verifyPayment({
  token,
  sessionId,
}: VerifyPaymentProps): Promise<CustomError | boolean> {
  try {
    if (!token || !sessionId) {
      return new CustomError(
        "BAD_REQUEST",
        "Token ou ID da sessão não fornecido.",
      );
    }

    const response = await api.GET(
      `/payment/verify-payment/${sessionId}`,
      token,
      {},
      { cache: "no-store" },
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao verificar o pagamento.");
    }

    const { success } = await response.json();

    return success;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Ocorreu um erro ao verificar o pagamento.",
    );
  }
}

export async function getProducts({
  token,
}: tokenProps): Promise<CustomError | StripeProduct[]> {
  try {
    if (!token) {
      return new CustomError("BAD_REQUEST", "Token não fornecido.");
    }

    const response = await api.GET(
      "/packages",
      token,
      {},
      {
        revalidate: 3600,
        tags: ["packages"],
      },
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao buscar os produtos.");
    }

    const products: StripeProduct[] = await response.json();

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Ocorreu um erro ao buscar os produtos.",
    );
  }
}

export async function getTransactionHistory({
  companyId,
  token,
}: GetTransactionHistoryProps): Promise<CustomError | CreditTransaction[]> {
  try {
    if (!token || !companyId) {
      return new CustomError(
        "BAD_REQUEST",
        "Token ou ID da empresa não fornecido.",
      );
    }

    // First get the company credit ID
    const creditResponse = await api.GET(
      `/companyCredits/byCompanyId/${companyId}`,
      token,
      {},
      { cache: "no-store" },
    );

    if (creditResponse instanceof CustomError || !creditResponse.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao buscar conta de créditos da empresa.",
      );
    }

    const creditData = await creditResponse.json();

    // Then fetch transactions
    const txResponse = await api.GET(
      `/creditTransactions/byCompanyCredit/${creditData.id}`,
      token,
      {},
      { cache: "no-store" },
    );

    if (txResponse instanceof CustomError || !txResponse.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao buscar histórico de transações.",
      );
    }

    const transactions: CreditTransaction[] = await txResponse.json();

    // Sort by date descending
    transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return transactions;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Ocorreu um erro ao buscar o histórico de transações.",
    );
  }
}
