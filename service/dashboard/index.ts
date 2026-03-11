import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import { DashboardResponse } from "@/types/dashboard";
import { GetDashboardProps } from "./dto";

const baseUrl = "/dashboard";

export async function getDashboard({
  month,
  year,
  token,
}: GetDashboardProps): Promise<DashboardResponse | CustomError> {
  try {
    if (!token) {
      return new CustomError("BAD_REQUEST", "Token não fornecido.");
    }

    const response = await api.GET(
      `${baseUrl}?month=${month}&year=${year}`,
      token,
    );

    if (response instanceof CustomError || !response.ok) {
      return new CustomError(
        "BAD_REQUEST",
        "Erro ao buscar os dados da dashboard.",
      );
    }

    const data: DashboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return new CustomError(
      "BAD_REQUEST",
      "Ocorreu um erro ao buscar os dados da dashboard.",
    );
  }
}
