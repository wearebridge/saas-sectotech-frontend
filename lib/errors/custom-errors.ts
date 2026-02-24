import { ErrorText } from "@/lib/constant/text";

export const codeErrors = {
  //api erros
  EXISTS: {
    code: 302,
    msg: ErrorText.exists,
  },
  API_PROBLEM: {
    code: 500,
    msg: ErrorText.bad_request,
  },
  NOT_FOUND: {
    code: 404,
    msg: ErrorText.not_found,
  },
  BAD_REQUEST: {
    code: 400,
    msg: ErrorText.bad_request,
  },
  PERMISSION_DND: {
    code: 403,
    msg: ErrorText.permission_dnd,
  },

  //sys error
  EMPTY_FIELD: {
    code: 600,
    msg: ErrorText.fill_fields,
  },
} as const;

export type CodeErrorKeys = keyof typeof codeErrors;

export interface SerializedError {
  message: string;
  statusCode: number;
  isError: true;
}

export class CustomError extends Error {
  public statusCode: number;

  constructor(error: CodeErrorKeys, message?: string) {
    const { code, msg } = codeErrors[error];

    const finalMsg = message ? message : msg;

    super(finalMsg);
    this.statusCode = code;
  }

  toJSON(): SerializedError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      isError: true,
    };
  }
}

export enum ErrorEnum {
  EXISTS = 302,
  API_PROBLEM = 500,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  PERMISSION_DND = 403,

  //sys error
  EMPTY_FIELD = 600,
}
