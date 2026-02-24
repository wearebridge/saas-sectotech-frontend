"use client";

import { useEffect } from "react";

function isVersionSkewError(message: string): boolean {
  return (
    message.includes("Failed to find Server Action") ||
    message.includes("Server action not found") ||
    message.includes("older or newer deployment") ||
    message.includes("SERVER_ACTIONS_NOT_FOUND")
  );
}

/**
 * Componente invisível que intercepta erros globais de Server Actions
 * causados por version skew (deploy novo com cliente antigo).
 * Quando detectado, recarrega a página automaticamente.
 */
export function VersionSkewHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason?.message || event.reason?.toString?.() || "";
      if (isVersionSkewError(message)) {
        event.preventDefault();
        console.warn(
          "[VersionSkew] Nova versão detectada, recarregando...",
        );
        window.location.reload();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || "";
      if (isVersionSkewError(message)) {
        event.preventDefault();
        console.warn(
          "[VersionSkew] Nova versão detectada, recarregando...",
        );
        window.location.reload();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
