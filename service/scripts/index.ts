"use server";

import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import {
  CreateScriptProps,
  DeleteScriptsProps,
  GetScriptsProps,
  UpdateScriptProps,
} from "@/service/scripts/dto";
import { Script } from "@/types/service";

const baseUrl = "/scripts";

export async function createScript({
  name,
  status,
  token,
  serviceTypeId,
  scriptItems,
}: CreateScriptProps): Promise<string | CustomError> {
  try {
    if (!token || !name) {
      return new CustomError("EMPTY_FIELD", "Falha ao criar o script");
    }

    const response = await api.POST(
      `${baseUrl}/byServiceType/${serviceTypeId}`,
      { name, status, scriptItems },
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao criar o script");
    }

    return "Script criado com sucesso";
  } catch (error) {
    console.error("Error creating script:", error);
    return new CustomError("BAD_REQUEST", "Erro ao criar o script");
  }
}

export async function updateScript({
  name,
  status,
  token,
  scriptId,
  scriptItems,
}: UpdateScriptProps): Promise<string | CustomError> {
  try {
    if (!token || !name) {
      return new CustomError("EMPTY_FIELD", "Falha ao alterar o script");
    }

    const response = await api.PUT(
      `${baseUrl}/${scriptId}`,
      { name, status, scriptItems },
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao alterar o script");
    }

    return "Script alterado com sucesso";
  } catch (error) {
    console.error("Error updating script:", error);
    return new CustomError("BAD_REQUEST", "Erro ao alterar o script");
  }
}

export async function getScripts({
  serviceTypeId,
  token,
}: GetScriptsProps): Promise<Script[] | CustomError> {
  try {
    if (!token) {
      return new CustomError("EMPTY_FIELD", "Falha ao consultar os scripts");
    }

    console.log(serviceTypeId);

    const url = serviceTypeId
      ? `${baseUrl}/byServiceType/${serviceTypeId}`
      : `${baseUrl}`;

    const response = await api.GET(
      url,
      token,
      {},
      {
        revalidate: 60,
        tags: ["scripts"],
      },
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao consultar os scripts");
    }

    const data = await response.json();

    return data as Script[];
  } catch (error) {
    console.error("Error fetching scripts by service:", error);
    return new CustomError("BAD_REQUEST", "Erro ao consultar os scripts");
  }
}

export async function deleteScript({
  id,
  token,
  item,
}: DeleteScriptsProps): Promise<string | CustomError> {
  try {
    if (!token || !id) {
      return new CustomError("EMPTY_FIELD", "Falha ao deletar o script");
    }

    const response = await api.PUT(
      `${baseUrl}/${id}`,
      { ...item, status: false },
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Falha ao deletar o script");
    }

    return "Script deletado com sucesso";
  } catch (error) {
    console.error("Error deleting script:", error);
    return new CustomError("BAD_REQUEST", "Erro ao deletar o script");
  }
}
