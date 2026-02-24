import { ServiceSubType } from "@/types/service";
import { tokenProps } from "@/types/token";

export interface CreateServiceSubTypeProps extends tokenProps {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateServiceSubTypeProps extends tokenProps {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface DeleteServiceSubTypeProps extends tokenProps {
  item: ServiceSubType;
}
