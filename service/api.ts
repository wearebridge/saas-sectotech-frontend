"use server";

import { CustomError } from "@/lib/errors/custom-errors";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type CacheOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
};

export type RequestOptions = CacheOptions & {
  timeout?: number;
};

export async function GET(
  url: string,
  auth?: string,
  header?: object,
  options?: RequestOptions,
): Promise<CustomError | Response> {
  try {
    if (!url) {
      return new CustomError("EMPTY_FIELD");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      ...header,
    };

    if (auth) {
      headers.Authorization = `Bearer ${auth}`;
    }

    const controller = new AbortController();
    const timeout = options?.timeout ?? 30000; // 30s padrão
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "GET",
        mode: "cors",
        headers,
        signal: controller.signal,
        // Otimizações de cache do Next.js
        ...(options?.cache && { cache: options.cache }),
        ...(options?.revalidate !== undefined && {
          next: {
            revalidate: options.revalidate,
            ...(options?.tags && { tags: options.tags }),
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        return new CustomError("PERMISSION_DND");
      }

      if (response.status === 400) {
        return new CustomError("BAD_REQUEST");
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        return new CustomError("API_PROBLEM");
      }
      throw error;
    }
  } catch {
    return new CustomError("API_PROBLEM");
  }
}

export async function POST(
  url: string,
  body: object,
  auth?: string,
  header?: object,
  options?: RequestOptions,
): Promise<Response | CustomError> {
  try {
    if (!url || !body) {
      return new CustomError("EMPTY_FIELD");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      ...header,
    };

    if (auth) {
      headers.Authorization = `Bearer ${auth}`;
    }

    const controller = new AbortController();
    const timeout = options?.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "POST",
        mode: "cors",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store", // POST nunca deve fazer cache
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        return new CustomError("PERMISSION_DND");
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        return new CustomError("API_PROBLEM");
      }
      throw error;
    }
  } catch {
    return new CustomError("API_PROBLEM");
  }
}

export async function PUT(
  url: string,
  body: object,
  auth: string,
  options?: RequestOptions,
): Promise<Response | CustomError> {
  try {
    if (!url || !body || !auth) {
      return new CustomError("EMPTY_FIELD");
    }

    const controller = new AbortController();
    const timeout = options?.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        return new CustomError("PERMISSION_DND");
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        return new CustomError("API_PROBLEM");
      }
      throw error;
    }
  } catch {
    return new CustomError("API_PROBLEM");
  }
}

export async function DELETE(
  url: string,
  body: object,
  auth: string,
  options?: RequestOptions,
): Promise<Response | CustomError> {
  try {
    if (!url || !body) {
      return new CustomError("EMPTY_FIELD");
    }

    const controller = new AbortController();
    const timeout = options?.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.status === 403) {
        return new CustomError("PERMISSION_DND");
      }

      if (response.status === 400) {
        return new CustomError("BAD_REQUEST");
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        return new CustomError("API_PROBLEM");
      }
      throw error;
    }
  } catch {
    return new CustomError("API_PROBLEM");
  }
}
