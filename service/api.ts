"use server";

import { CustomError } from "@/lib/errors/custom-errors";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  url: string,
  auth?: string,
  header?: object,
): Promise<CustomError | Response> {
  try {
    if (!url) {
      return new CustomError("EMPTY_FIELD");
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,

        ...header,
      },
    });

    if (response.status === 403) {
      return new CustomError("PERMISSION_DND");
    }

    return response;
  } catch {
    return new CustomError("API_PROBLEM");
  }
}

export async function POST(
  url: string,
  body: object,
  auth?: string,
  header?: object,
): Promise<Response | CustomError> {
  try {
    if (!url || !body) {
      return new CustomError("EMPTY_FIELD");
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,

        ...header,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 403) {
      return new CustomError("PERMISSION_DND");
    }

    return response;
  } catch (err) {
    return new CustomError("API_PROBLEM");
  }
}

export async function PUT(
  url: string,
  body: object,
  auth: string,
): Promise<Response | CustomError> {
  try {
    if (!url || !body || !auth) {
      return new CustomError("EMPTY_FIELD");
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 403) {
      return new CustomError("PERMISSION_DND");
    }

    return response;
  } catch {
    return new CustomError("API_PROBLEM");
  }
}

export async function DELETE(
  url: string,
  body: object,
  auth: string,
): Promise<Response | CustomError> {
  try {
    if (!url || !body) {
      return new CustomError("EMPTY_FIELD");
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 403) {
      return new CustomError("PERMISSION_DND");
    }

    return response;
  } catch {
    return new CustomError("API_PROBLEM");
  }
}
