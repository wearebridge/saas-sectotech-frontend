"use client";

import { useEffect } from "react";

const isVersionSkewError = (error: Error & { digest?: string }) =>
  error.message?.includes("Failed to find Server Action") ||
  error.message?.includes("older or newer deployment") ||
  error.digest === "NEXT_NOT_FOUND";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[GlobalError]", error);

  useEffect(() => {
    if (isVersionSkewError(error)) {
      window.location.reload();
    }
  }, [error]);

  if (isVersionSkewError(error)) {
    return (
      <html lang="pt-br">
        <body className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Atualizando aplicação...
            </h2>
            <p className="text-gray-600 text-sm">
              Uma nova versão foi detectada. A página será recarregada
              automaticamente.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-br">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-8 space-y-4">
          <h2 className="text-2xl font-bold text-red-600">
            Algo deu errado!
          </h2>

          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-700">Mensagem do erro:</p>
            <pre className="bg-red-50 text-red-800 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words border border-red-200">
              {error.message || "Erro desconhecido"}
            </pre>
          </div>

          {error.digest && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-700">Digest:</p>
              <code className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded block">
                {error.digest}
              </code>
            </div>
          )}

          {error.stack && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                Stack trace
              </summary>
              <pre className="mt-2 bg-gray-100 text-gray-700 p-4 rounded overflow-x-auto whitespace-pre-wrap break-words text-xs max-h-64 overflow-y-auto">
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
      </body>
    </html>
  );
}
