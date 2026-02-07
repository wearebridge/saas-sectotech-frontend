"use server";

import * as api from "@/service/api";
import { CustomError } from "@/lib/errors/custom-errors";
import { ServiceSubType } from "@/types/service";
import { tokenProps } from "@/types/token";

const baseUrl = "/service-sub-types";

interface CreateServiceSubTypeProps extends tokenProps {
  name: string;
  description?: string;
}

export async function createServiceSubType({
  token,
  name,
  description,
}: CreateServiceSubTypeProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError(
      "PERMISSION_DND",
      "Erro ao criar subtipo de serviço.",
    );
  }

  try {
    if (!name) {
      return new CustomError(
        "EMPTY_FIELD",
        "O nome do subtipo de serviço é obrigatório.",
      );
    }

    const response = await api.POST(`${baseUrl}`, { name, description }, token);

    if (response instanceof CustomError) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao criar subtipo de serviço.",
      );
    }

    if (!response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao criar subtipo de serviço.",
      );
    }

    return "Subtipo de serviço criado com sucesso";
  } catch (error) {
    console.error("Error creating service subtype:", error);
    return new CustomError("BAD_REQUEST", "Erro ao criar subtipo de serviço.");
  }
}

interface UpdateServiceSubTypeProps extends tokenProps {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export async function updateServiceSubTypes({
  id,
  name,
  status,
  token,
  description,
}: UpdateServiceSubTypeProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError(
      "PERMISSION_DND",
      "Erro ao criar subtipo de serviço.",
    );
  }

  try {
    if (!name || !id || status === undefined) {
      return new CustomError(
        "EMPTY_FIELD",
        "O nome, ID e status do subtipo de serviço são obrigatórios.",
      );
    }

    const response = await api.PUT(
      `${baseUrl}/${id}`,
      { name, description, status: status === "active" },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao atualizar subtipo de serviço.",
      );
    }

    if (!response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao atualizar subtipo de serviço.",
      );
    }

    return "Subtipo de serviço atualizado com sucesso";
  } catch (error) {
    console.error("Error updating service subtype:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao atualizar subtipo de serviço.",
    );
  }
}

export async function getServiceSubTypes({
  token,
}: tokenProps): Promise<ServiceSubType[] | CustomError> {
  try {
    if (!token) {
      return new CustomError(
        "PERMISSION_DND",
        "Erro ao buscar subtipos de serviço.",
      );
    }

    const response = await api.GET(`${baseUrl}`, token);

    if (response instanceof CustomError) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao buscar subtipos de serviço.",
      );
    }

    const data = await response.json();

    return data as ServiceSubType[];
  } catch (error) {
    console.error("Error fetching service subtypes:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao buscar subtipos de serviço.",
    );
  }
}

interface DeleteServiceSubTypeProps extends tokenProps {
  item: ServiceSubType;
}

export async function deleteServiceSubType({
  item,
  token,
}: DeleteServiceSubTypeProps): Promise<string | CustomError> {
  try {
    if (!token) {
      return new CustomError(
        "PERMISSION_DND",
        "Erro ao buscar subtipos de serviço.",
      );
    }

    const response = await api.PUT(
      `${baseUrl}/${item.id}`,
      { ...item, status: false },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao deletar subtipo de serviço.",
      );
    }

    if (!response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao deletar subtipo de serviço.",
      );
    }

    return "Subtipo desativado com sucesso";
  } catch (error) {
    console.error("Error deleting service subtype:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao deletar subtipo de serviço.",
    );
  }
}
