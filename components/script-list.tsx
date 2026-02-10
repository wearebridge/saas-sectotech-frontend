"use client";

import { useEffect, useState, useCallback } from "react";
import { useKeycloak } from "@/lib/keycloak";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScriptForm } from "./common/scripts/script-form";

export interface ScriptItem {
  id: string;
  question: string;
  answer?: string;
}

export interface Script {
  id: string;
  name: string;
  status: boolean;
  scriptItems?: ScriptItem[];
}

interface ScriptListProps {
  serviceTypeId: string;
  refreshTrigger: number;
}

export function ScriptList({ serviceTypeId, refreshTrigger }: ScriptListProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const { token, authenticated } = useKeycloak();

  const fetchScripts = useCallback(async () => {
    if (!token || !serviceTypeId) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/scripts/byServiceType/${serviceTypeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao carregar scripts");
      }

      const data = await response.json();
      setScripts(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar lista de scripts");
    } finally {
      setIsLoading(false);
    }
  }, [token, serviceTypeId]);

  useEffect(() => {
    if (authenticated && serviceTypeId) {
      fetchScripts();
    }
  }, [authenticated, serviceTypeId, fetchScripts, refreshTrigger]);

  const handleEditSuccess = () => {
    setEditingScript(null);
    fetchScripts();
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (scripts.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhum script encontrado.</p>
        <p className="text-sm text-muted-foreground">
          Crie um novo para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <div
            key={script.id}
            onClick={() => setEditingScript(script)}
            className="cursor-pointer"
          >
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{script.name}</CardTitle>
                  <Badge variant={script.status ? "default" : "secondary"}>
                    {script.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>
                  {script.scriptItems
                    ? `${script.scriptItems.length} itens`
                    : "0 itens"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>

      {editingScript && (
        <ScriptForm
          serviceTypeId={serviceTypeId}
          scriptId={editingScript.id}
          initialData={{
            name: editingScript.name,
            status: editingScript.status || false,
            scriptItems:
              editingScript.scriptItems?.map((item) => ({
                question: item.question,
                answer: item.answer,
              })) || [],
          }}
          open={true}
          onOpenChange={(open) => !open && setEditingScript(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
