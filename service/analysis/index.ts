"use server";

import * as api from "@/service/api";
import { CustomError } from "@/lib/errors/custom-errors";
import { tokenProps } from "@/types/token";

const baseUrl = "/analysis-results";

interface GetAnalysisByIdProps extends tokenProps {
  id: string;
}

export async function getAnalysisById({
  id,
  token,
}: GetAnalysisByIdProps): Promise<unknown | CustomError> {
  try {
    if (!token || !id) {
      return new CustomError("EMPTY_FIELD", "Falha ao carregar a análise");
    }

    const response = await api.GET(
      `${baseUrl}/${id}`,
      token,
      {},
      {
        revalidate: 30,
        tags: ["analysis-results", `analysis-${id}`],
      },
    );

    if (!(response instanceof CustomError) && response.ok) {
      return await response.json();
    }

    const fallback = await api.GET(
      `${baseUrl}`,
      token,
      {},
      {
        revalidate: 30,
        tags: ["analysis-results"],
      },
    );

    if (fallback instanceof CustomError || !fallback.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao carregar a análise");
    }

    const data = await fallback.json();
    const match = Array.isArray(data)
      ? data.find((item) => item.id === id)
      : null;

    if (!match) {
      return new CustomError("NOT_FOUND", "Análise não encontrada");
    }

    return match;
  } catch (error) {
    console.error("Error fetching analysis by id:", error);
    return new CustomError("BAD_REQUEST", "Falha ao carregar a análise");
  }
}
