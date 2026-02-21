"use server";
import { User } from "@/types/users";
import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import { tokenProps } from "@/types/token";
import { ClientCredentials } from "@/types/users";
import {
  CreateUsersProps,
  UpdateUserProps,
  DisableUserProps,
  ResetPasswordProps,
  ChangeOwnPasswordProps,
} from "./dto";

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

    const response = await api.GET(
      `${baseUrl}/credentials`,
      token,
      {},
      {
        revalidate: 300,
        tags: ["credentials"],
      },
    );

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

export async function createUsers({
  email,
  firstName,
  lastName,
  username,
  password,
  token,
}: CreateUsersProps): Promise<CustomError | boolean> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao criar usuário. Token de autenticação ausente.",
      );
    }
    const response = await api.POST(
      `/company/users`,
      {
        email,
        firstName,
        lastName,
        username,
        password,
      },
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Email ou nome de usuário já existe",
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return new CustomError("BAD_REQUEST", "Erro ao criar usuário");
  }
}

export async function updateUser({
  userId,
  firstName,
  lastName,
  email,
  token,
}: UpdateUserProps): Promise<CustomError | boolean> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao atualizar usuário. Token de autenticação ausente.",
      );
    }

    const response = await api.PUT(
      `/company/users/${userId}`,
      { firstName, lastName, email },
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao atualizar usuário",
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return new CustomError("BAD_REQUEST", "Erro ao atualizar usuário");
  }
}

export async function disableUser({
  userId,
  token,
}: DisableUserProps): Promise<CustomError | boolean> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao desativar usuário. Token de autenticação ausente.",
      );
    }

    const response = await api.PUT(
      `/company/users/${userId}/disable`,
      {},
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao desativar usuário",
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    return new CustomError("BAD_REQUEST", "Erro ao desativar usuário");
  }
}

export async function resetUserPassword({
  userId,
  newPassword,
  temporary = true,
  token,
}: ResetPasswordProps): Promise<CustomError | boolean> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao resetar senha. Token de autenticação ausente.",
      );
    }

    const response = await api.PUT(
      `/company/users/${userId}/password`,
      { newPassword, temporary },
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao resetar senha do usuário",
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return new CustomError("BAD_REQUEST", "Erro ao resetar senha do usuário");
  }
}

export async function changeOwnPassword({
  currentPassword,
  newPassword,
  token,
}: ChangeOwnPasswordProps): Promise<CustomError | boolean> {
  try {
    if (!token) {
      return new CustomError(
        "EMPTY_FIELD",
        "Falha ao alterar senha. Token de autenticação ausente.",
      );
    }

    const response = await api.PUT(
      `/company/users/me/password`,
      { currentPassword, newPassword },
      token,
    );

    if (response instanceof Error || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Senha atual incorreta ou erro ao alterar senha",
      );
    }
    return true;
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return new CustomError("BAD_REQUEST", "Erro ao alterar senha");
  }
}
