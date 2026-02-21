import { tokenProps } from "@/types/token";

export interface CreateUsersProps extends tokenProps {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface UpdateUserProps extends tokenProps {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DisableUserProps extends tokenProps {
  userId: string;
}

export interface ResetPasswordProps extends tokenProps {
  userId: string;
  newPassword: string;
  temporary?: boolean;
}

export interface ChangeOwnPasswordProps extends tokenProps {
  currentPassword: string;
  newPassword: string;
}
