import { SerializedError } from "./custom-errors";

export function isSerializedError(value: unknown): value is SerializedError {
  return (
    typeof value === "object" &&
    value !== null &&
    "isError" in value &&
    (value as Record<string, unknown>).isError === true &&
    "message" in value &&
    "statusCode" in value
  );
}

export function getErrorMessage(response: unknown): string | null {
  if (isSerializedError(response)) {
    return response.message;
  }
  if (response instanceof Error) {
    return response.message;
  }
  return null;
}
