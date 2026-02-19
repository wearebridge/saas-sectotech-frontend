"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useKeycloak } from "@/lib/keycloak";
import { ClientService } from "@/service/client/client-service";
import { ClientResponse } from "@/types/client";
import { DashboardTable } from "@/components/dashboard-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientAnalysesPage() {
  const params = useParams();
  const { token } = useKeycloak();
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const clientId = params.id as string;

  useEffect(() => {
    const loadClient = async () => {
      if (!token || !clientId) return;

      try {
        const data = await ClientService.findById(clientId, token);
        setClient(data);
      } catch (error) {
        console.error("Error loading client:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [token, clientId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 mb-1" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">
                {client
                  ? `${client.fullName}`
                  : "Cliente não encontrado"}
              </h1>
              <p className="text-muted-foreground">
                Histórico de análises do cliente
                {client?.cpf && (
                  <span className="ml-2 font-mono text-xs">
                    CPF:{" "}
                    {client.cpf.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4",
                    )}
                  </span>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      <DashboardTable clientId={clientId} />
    </div>
  );
}
