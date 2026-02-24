import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import { ServiceType } from "@/types/service";
import {
  CreateServiceProps,
  DeleteServiceProps,
  GetServicesProps,
  UpdateServiceProps,
} from "@/service/services-type/dto";

const baseUrl = "/service-types";

export async function createService({
  name,
  token,
  description,
  subtypeId,
}: CreateServiceProps): Promise<string | CustomError> {
  try {
    if (!token || !name || !subtypeId) {
      return new CustomError("EMPTY_FIELD", "Falha ao criar um novo serviço.");
    }

    const request = await api.POST(
      `${baseUrl}/byServiceSubType/${subtypeId}`,
      { name, description },
      token,
    );

    if (request instanceof Error || !request.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao criar o serviço.");
    }

    return "Serviço criado com sucesso!";
  } catch (error) {
    console.log(error);
    return new CustomError("BAD_REQUEST", "Falha ao criar um novo serviço.");
  }
}

export async function updateService({
  serviceId,
  name,
  status,
  token,
  description,
}: UpdateServiceProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError("PERMISSION_DND", "Erro ao atualizar o serviço.");
  }

  try {
    if (!name || !serviceId || status === undefined) {
      return new CustomError(
        "EMPTY_FIELD",
        "O nome, ID e status do serviço são obrigatórios.",
      );
    }

    const response = await api.PUT(
      `${baseUrl}/${serviceId}`,
      { name, description, status: status === "active" },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Erro ao atualizar o serviço.");
    }

    if (!response.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao atualizar o serviço.");
    }

    return "Serviço atualizado com sucesso";
  } catch (error) {
    console.error("Error updating service:", error);
    return new CustomError("BAD_REQUEST", "Erro ao atualizar serviço.");
  }
}

export async function getServices({
  token,
  serviceSubTypeId,
}: GetServicesProps): Promise<CustomError | ServiceType[]> {
  try {
    if (!token || !serviceSubTypeId) {
      return new CustomError("PERMISSION_DND", "Erro ao buscar os serviços");
    }

    const response = await api.GET(
      `${baseUrl}/byServiceSubType/${serviceSubTypeId}`,
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao buscar os serviços");
    }

    const data = await response.json();

    return data as ServiceType[];
  } catch (error) {
    console.log(error);

    return new CustomError("BAD_REQUEST", "Erro ao buscar os serviços");
  }
}

export async function deleteService({
  item,
  token,
}: DeleteServiceProps): Promise<string | CustomError> {
  try {
    if (!token || !item) {
      return new CustomError("PERMISSION_DND", "Erro ao desativar serviço.");
    }

    const response = await api.PUT(
      `${baseUrl}/${item.id}`,
      { name: item.name, description: item.description, status: false },
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError("BAD_REQUEST", "Erro ao desativar serviço.");
    }

    return "Serviço desativado com sucesso";
  } catch (error) {
    console.error("Error deleting service sub type:", error);
    return new CustomError("BAD_REQUEST", "Erro ao desativar serviço.");
  }
}
