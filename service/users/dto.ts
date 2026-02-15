import { tokenProps } from "@/types/token";

export interface CreateUsersProps extends tokenProps {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}
