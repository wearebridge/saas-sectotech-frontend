/**
 * Wrapper para chamadas de Server Actions que detecta erros de version skew
 * (quando o servidor foi redeployado e os IDs das server actions mudaram)
 * e recarrega a página automaticamente.
 */
export function isServerActionError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message?.includes("Failed to find Server Action") ||
      error.message?.includes("Server action not found") ||
      error.message?.includes("older or newer deployment") ||
      error.message?.includes("SERVER_ACTIONS_NOT_FOUND")
    );
  }
  if (typeof error === "string") {
    return (
      error.includes("Failed to find Server Action") ||
      error.includes("Server action not found")
    );
  }
  return false;
}

export function handleServerActionError(error: unknown): void {
  if (isServerActionError(error)) {
    console.warn(
      "[Version Skew] Nova versão detectada, recarregando página...",
    );
    window.location.reload();
  }
}

/**
 * Executa uma Server Action com tratamento automático de version skew.
 * Se o servidor foi atualizado e a action não existe mais, recarrega a página.
 *
 * @example
 * const result = await callServerAction(() => getSubTypeService({ token }));
 */
export async function callServerAction<T>(
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    handleServerActionError(error);
    throw error;
  }
}
