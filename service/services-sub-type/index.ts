"use server";

import * as api from "@/service/api";
import { CustomError } from "@/lib/errors/custom-errors";

import { tokenProps } from "@/types/token";
import { ServiceSubType } from "@/types/analysis";
import {
  DeleteServiceSubTypeProps,
  CreateServiceSubTypeProps,
  UpdateServiceSubTypeProps,
} from "@/service/services-sub-type/dto";

const baseUrl = "/service-sub-types";

export async function createServiceSubType({
  token,
  name,
  description,
}: CreateServiceSubTypeProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError(
      "PERMISSION_DND",
      "Erro ao criar o subtipo do serviço.",
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
        "Erro ao criar subtipo do serviço.",
      );
    }

    if (!response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao criar subtipo do serviço.",
      );
    }

    return "Subtipo de serviço criado com sucesso!";
  } catch (error) {
    console.error("Error creating service:", error);
    return new CustomError("BAD_REQUEST", "Erro ao criar subtipo de serviço.");
  }
}

export async function updateServiceSubType({
  id,
  name,
  status,
  token,
  description,
}: UpdateServiceSubTypeProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError(
      "PERMISSION_DND",
      "Erro ao atualizar subtipo de serviço.",
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
        "Erro ao atualizar o subtipo de serviço.",
      );
    }

    if (!response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao atualizar o subtipo de serviço.",
      );
    }

    return "Subtipo de serviço atualizado com sucesso";
  } catch (error) {
    console.error("Error updating service sub type:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao atualizar o subtipo de serviço.",
    );
  }
}

export async function getSubTypeService({
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
    console.error("Error fetching sub types of service:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao buscar subtipos de serviço.",
    );
  }
}

export async function deleteServiceSubType({
  item,
  token,
}: DeleteServiceSubTypeProps): Promise<string | CustomError> {
  try {
    if (!token) {
      return new CustomError(
        "PERMISSION_DND",
        "Erro ao deletar subtipo de serviço.",
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

    return "Subtipo de serviço desativado com sucesso";
  } catch (error) {
    console.error("Error deleting service sub type:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Erro ao deletar subtipo de serviço.",
    );
  }
}
