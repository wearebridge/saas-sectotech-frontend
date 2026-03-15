import * as api from "@/service/api";
import { CustomError } from "@/lib/errors/custom-errors";
import { tokenProps } from "@/types/token";

const baseUrl = "/analysis-results";

interface GetAudioDownloadUrlProps extends tokenProps {
  id: string;
}

export async function getAudioDownloadUrl({
  id,
  token,
}: GetAudioDownloadUrlProps): Promise<string | CustomError> {
  try {
    if (!token || !id) {
      return new CustomError("EMPTY_FIELD", "Dados insuficientes para gerar URL de download");
    }

    const response = await api.GET(`${baseUrl}/${id}/download-url`, token);

    if (response instanceof CustomError) {
      return response;
    }

    if (!response.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao gerar URL de download do áudio");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error getting audio download URL:", error);
    return new CustomError("BAD_REQUEST", "Erro ao gerar URL de download");
  }
}

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
    );

    if (!(response instanceof CustomError) && response.ok) {
      return await response.json();
    }

    const fallback = await api.GET(
      `${baseUrl}`,
      token,
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

interface OverrideAnalysisQuestionProps extends tokenProps {
  id: string;
  questionIndex: number;
  correct?: boolean | null;
  questionAsked?: boolean | null;
}

export async function overrideAnalysisQuestion({
  id,
  questionIndex,
  correct,
  questionAsked,
  token,
}: OverrideAnalysisQuestionProps): Promise<unknown | CustomError> {
  try {
    if (!token || !id) {
      return new CustomError(
        "EMPTY_FIELD",
        "Dados insuficientes para corrigir a questão",
      );
    }

    const body: Record<string, unknown> = { questionIndex };
    if (correct !== undefined && correct !== null) body.correct = correct;
    if (questionAsked !== undefined && questionAsked !== null)
      body.questionAsked = questionAsked;

    const response = await api.PATCH(
      `${baseUrl}/${id}/questions/override`,
      body,
      token,
    );

    if (response instanceof CustomError) {
      return response;
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Falha ao corrigir a questão";

      if (contentType?.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
      }

      return new CustomError("BAD_REQUEST", errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error overriding analysis question:", error);
    return new CustomError("BAD_REQUEST", "Erro ao corrigir a questão");
  }
}

interface RegenerateAnalysisProps extends tokenProps {
  id: string;
}

export async function regenerateAnalysis({
  id,
  token,
}: RegenerateAnalysisProps): Promise<unknown | CustomError> {
  try {
    if (!token || !id) {
      return new CustomError(
        "EMPTY_FIELD",
        "Dados insuficientes para re-gerar a análise",
      );
    }

    const response = await api.POST(
      `${baseUrl}/${id}/regenerate`,
      {},
      token,
      {},
      { timeout: 120000 },
    );

    if (response instanceof CustomError) {
      return response;
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Falha ao re-gerar a análise";

      if (contentType?.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
      } else {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage = errorBody;
        }
      }

      console.error("Regenerate analysis error:", errorMessage);
      return new CustomError("BAD_REQUEST", errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error regenerating analysis:", error);
    return new CustomError("BAD_REQUEST", "Erro ao re-gerar a análise");
  }
}
