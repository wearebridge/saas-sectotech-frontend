"use server";

import * as api from "@/service/api";
import { CustomError } from "@/lib/errors/custom-errors";
import { Client } from "@/types/client";
import { tokenProps } from "@/types/token";

const baseUrl = "/clients";

interface CreateClientProps extends tokenProps {
  fullName: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  phone?: string;
  email?: string;
  gender?: string;
}

export async function createClient({
  token,
  fullName,
  birthDate,
  cpf,
  rg,
  address,
  phone,
  email,
  gender,
}: CreateClientProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError("PERMISSION_DND", "Error creating client.");
  }

  try {
    if (!fullName) {
      return new CustomError("EMPTY_FIELD", "Full name is required.");
    }

    const response = await api.POST(
      `${baseUrl}`,
      { fullName, birthDate, cpf, rg, address, phone, email, gender },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Error creating client.");
    }

    if (!response.ok) {
      return new CustomError("BAD_REQUEST", "Error creating client.");
    }

    return "Client created successfully";
  } catch (error) {
    console.error("Error creating client:", error);
    return new CustomError("BAD_REQUEST", "Error creating client.");
  }
}

interface UpdateClientProps extends tokenProps {
  id: string;
  fullName: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  phone?: string;
  email?: string;
  gender?: string;
  status: string;
}

export async function updateClient({
  id,
  fullName,
  birthDate,
  cpf,
  rg,
  address,
  phone,
  email,
  gender,
  status,
  token,
}: UpdateClientProps): Promise<string | CustomError> {
  if (!token) {
    return new CustomError("PERMISSION_DND", "Error updating client.");
  }

  try {
    if (!fullName || !id || status === undefined) {
      return new CustomError(
        "EMPTY_FIELD",
        "Full name, ID and status are required.",
      );
    }

    const response = await api.PUT(
      `${baseUrl}/${id}`,
      {
        fullName,
        birthDate,
        cpf,
        rg,
        address,
        phone,
        email,
        gender,
        status: status === "active",
      },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Error updating client.");
    }

    if (!response.ok) {
      return new CustomError("BAD_REQUEST", "Error updating client.");
    }

    return "Client updated successfully";
  } catch (error) {
    console.error("Error updating client:", error);
    return new CustomError("BAD_REQUEST", "Error updating client.");
  }
}

export async function getClients({
  token,
}: tokenProps): Promise<Client[] | CustomError> {
  try {
    if (!token) {
      return new CustomError("PERMISSION_DND", "Error fetching clients.");
    }

    const response = await api.GET(
      `${baseUrl}`,
      token,
      {},
      {
        revalidate: 30,
        tags: ["clients"],
      },
    );

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Error fetching clients.");
    }

    const data = await response.json();

    return data as Client[];
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new CustomError("BAD_REQUEST", "Error fetching clients.");
  }
}

interface DeleteClientProps extends tokenProps {
  item: Client;
}

export async function deleteClient({
  item,
  token,
}: DeleteClientProps): Promise<string | CustomError> {
  try {
    if (!token) {
      return new CustomError("PERMISSION_DND", "Error deleting client.");
    }

    const response = await api.PUT(
      `${baseUrl}/${item.id}`,
      { ...item, status: false },
      token,
    );

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Error deleting client.");
    }

    if (!response.ok) {
      return new CustomError("BAD_REQUEST", "Error deleting client.");
    }

    return "Client deactivated successfully";
  } catch (error) {
    console.error("Error deleting client:", error);
    return new CustomError("BAD_REQUEST", "Error deleting client.");
  }
}
