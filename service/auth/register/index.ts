"use server";

import { CustomError } from "@/lib/errors/custom-errors";
import * as api from "@/service/api";
import { CompanyRegistrationDTO } from "./dto";

export async function registerCompany({
  adminEmail,
  adminFirstName,
  adminLastName,
  adminUsername,
  adminPassword,
  companyName,
}: CompanyRegistrationDTO): Promise<true | CustomError> {
  try {
    const response = await api.POST(`/public/register/company`, {
      adminEmail: adminEmail,
      adminFirstName: adminFirstName,
      adminLastName: adminLastName,
      adminUsername: adminUsername,
      adminPassword: adminPassword,
      companyName: companyName,
    });

    console.log(response);

    if (response instanceof CustomError) {
      return new CustomError("BAD_REQUEST", "Falha ao registrar empresa.");
    }

    if (response.status === 401) {
      console.log(response.status);

      return new CustomError(
        "PERMISSION_DND",
        "usuário ou email já cadastrado.",
      );
    }

    return true;
  } catch (error) {
    console.log(error);

    return new CustomError("BAD_REQUEST", "Erro ao registrar empresa.");
  }
}
