import { ClientRequest, ClientResponse } from "@/types/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ClientService {
  static async findAll(token: string): Promise<ClientResponse[]> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      next: {
        revalidate: 30,
        tags: ["clients"],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clients");
    }

    return response.json();
  }

  static async findById(id: string, token: string): Promise<ClientResponse> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      next: {
        revalidate: 60,
        tags: ["clients", `client-${id}`],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch client");
    }

    return response.json();
  }

  static async create(
    data: ClientRequest,
    token: string,
  ): Promise<ClientResponse> {
    // Convert string status to boolean for backend
    const backendData = {
      ...data,
      status: data.status === "active",
    };

    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify(backendData),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to create client");
    }

    return response.json();
  }

  static async update(
    id: string,
    data: ClientRequest,
    token: string,
  ): Promise<ClientResponse> {
    // Convert string status to boolean for backend
    const backendData = {
      ...data,
      status: data.status === "active",
    };

    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify(backendData),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to update client");
    }

    return response.json();
  }

  static async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to delete client");
    }
  }

  static async search(query: string, token: string): Promise<ClientResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/clients/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        next: {
          revalidate: 10,
          tags: ["clients"],
        },
      },
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar clientes");
    }

    return response.json();
  }
}
