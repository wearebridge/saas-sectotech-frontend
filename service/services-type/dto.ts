import { ServiceType } from "@/types/service";
import { tokenProps } from "@/types/token";

export interface DeleteServiceProps extends tokenProps {
  item: ServiceType;
}

export interface GetServicesProps extends tokenProps {
  serviceSubTypeId: string;
}

export interface CreateServiceProps extends tokenProps {
  name: string;
  description?: string;
  subtypeId: string;
}

export interface UpdateServiceProps extends tokenProps {
  name: string;
  serviceId: string;
  description?: string;
  status: string;
}
