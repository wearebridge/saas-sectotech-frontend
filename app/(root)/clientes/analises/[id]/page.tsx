"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useKeycloak } from "@/lib/keycloak";
import { ClientService } from "@/service/client/client-service";
import { ClientResponse, ClientRequest } from "@/types/client";
import { DashboardTable } from "@/components/root/dashboard/dashboard-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/root/clients/client-form";
import { toast } from "sonner";

export default function ClientAnalysesPage() {
  const params = useParams();
  const { token } = useKeycloak();
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 mb-1" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {client ? `${client.fullName}` : "Cliente não encontrado"}
              </h1>
              <div className="text-muted-foreground text-sm md:text-base">
                <p>Histórico de análises do cliente</p>
                {client?.cpf && (
                  <p className="font-mono text-xs mt-2">
                    CPF:{" "}
                    {client.cpf.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4",
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        {!loading && client && (
          <Button
            onClick={() => setOpenDialog(true)}
            className="w-full md:w-auto"
          >
            Editar Cliente
          </Button>
        )}
      </div>

      <DashboardTable clientId={clientId} isClientView={true} />

      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {client && (
            <ClientForm
              client={client}
              onSubmit={async (data: ClientRequest) => {
                try {
                  await ClientService.update(clientId, data, token!);
                  toast.success("Cliente atualizado com sucesso!");
                  const updatedClient = await ClientService.findById(
                    clientId,
                    token!,
                  );
                  setClient(updatedClient);
                  setOpenDialog(false);
                } catch (error) {
                  toast.error("Erro ao atualizar cliente.");
                }
              }}
              onCancel={() => {
                setOpenDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
