"use server";
import { User } from "@/types/users";
import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import { tokenProps } from "@/types/token";
import { ClientCredentials } from "@/types/users";

const baseUrl = "/companies/current";

export async function getCredentials({
  token,
}: tokenProps): Promise<CustomError | ClientCredentials> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao obter credenciais da empresa. Token de autenticação ausente.",
      );
    }

    const response = await api.GET(`${baseUrl}/credentials`, token);

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao obter credenciais da empresa",
      );
    }

    const data = await response.json();
    return data as ClientCredentials;
  } catch (error) {
    console.error("Erro ao obter credenciais:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao obter credenciais da empresa",
    );
  }
}

export async function regenerateCredentials({
  token,
}: tokenProps): Promise<CustomError | ClientCredentials> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao regenerar credenciais da empresa. Token de autenticação ausente.",
      );
    }

    const response = await api.POST(
      `${baseUrl}/credentials/regenerate`,
      {},
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao regenerar credenciais da empresa",
      );
    }

    const data = await response.json();
    return data as ClientCredentials;
  } catch (error) {
    console.error("Erro ao regenerar credenciais:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao regenerar credenciais da empresa",
    );
  }
}
