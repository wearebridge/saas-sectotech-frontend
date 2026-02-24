"use client";

import { useEffect } from "react";

const isVersionSkewError = (error: Error & { digest?: string }) =>
  error.message?.includes("Failed to find Server Action") ||
  error.message?.includes("older or newer deployment") ||
  error.digest === "NEXT_NOT_FOUND";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[RootError]", error);

  useEffect(() => {
    if (isVersionSkewError(error)) {
      window.location.reload();
    }
  }, [error]);

  if (isVersionSkewError(error)) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 space-y-4 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Atualizando aplicação...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Uma nova versão foi detectada. A página será recarregada
            automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 space-y-4 border border-red-200 dark:border-red-800">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Erro na página
        </h2>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Mensagem do erro:
          </p>
          <pre className="bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words border border-red-200 dark:border-red-800">
            {error.message || "Erro desconhecido"}
          </pre>
        </div>

        {error.digest && (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Digest:
            </p>
            <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded block">
              {error.digest}
            </code>
          </div>
        )}

        {error.stack && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              Stack trace
            </summary>
            <pre className="mt-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words text-xs max-h-64 overflow-y-auto">
              {error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
