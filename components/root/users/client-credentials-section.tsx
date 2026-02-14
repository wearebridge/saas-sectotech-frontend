"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useKeycloak } from "@/lib/keycloak";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ClientCredentials } from "@/types/users";
import { getCredentials, regenerateCredentials } from "@/service/users";

export function ClientCredentialsSection() {
  const [credentials, setCredentials] = useState<ClientCredentials | null>(
    null,
  );
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { token } = useKeycloak();

  const handleGetCredentials = async () => {
    try {
      if (!token) {
        toast.error(
          "Token de autenticação ausente. Por favor, faça login novamente.",
        );
        return;
      }

      setLoading(true);

      const result = await getCredentials({ token: token });

      if (result instanceof Error) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      setCredentials(result);
      setLoading(false);
    } catch {
      toast.error("Erro ao carregar credenciais da empresa");
      setLoading(false);
    }
  };

  const regenerateSecret = async () => {
    try {
      if (!token) {
        toast.error(
          "Token de autenticação ausente. Por favor, faça login novamente.",
        );
        return;
      }

      setRegenerating(true);
      const result = await regenerateCredentials({ token: token });

      if (result instanceof Error) {
        toast.error(result.message);
        setRegenerating(false);
        return;
      }

      setCredentials(result);

      toast.success("Client Secret regenerado com sucesso!");
      setShowSecret(true);
    } catch (error) {
      console.error("Erro ao regenerar credenciais:", error);
      toast.error("Erro ao regenerar Client Secret");
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado para a área de transferência`);
    } catch (error) {
      toast.error("Erro ao copiar para a área de transferência");
    }
  };

  useEffect(() => {
    if (token) {
      handleGetCredentials();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-10 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    );
  }

  if (!credentials?.clientId) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Nenhuma credencial de client encontrada para esta empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col ">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Client Credentials</Label>
          <Badge variant="secondary">API Access</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Use essas credenciais para acessar a API via Client Credentials Flow.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID</Label>
          <div className="flex gap-2">
            <Input
              id="clientId"
              value={credentials.clientId}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(credentials.clientId, "Client ID")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientSecret">Client Secret</Label>
          <div className="flex gap-2">
            <Input
              id="clientSecret"
              type={showSecret ? "text" : "password"}
              value={credentials.clientSecret || ""}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                copyToClipboard(credentials.clientSecret, "Client Secret")
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Regenerar Client Secret</p>
            <p className="text-xs text-muted-foreground">
              Isso invalidará o secret atual e criará um novo.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={regenerateSecret}
            disabled={regenerating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`}
            />
            {regenerating ? "Regenerando..." : "Regenerar"}
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Como usar:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Obter token de acesso:</p>
            <code className="block bg-muted p-2 rounded text-xs font-mono">
              POST /realms/secto/protocol/openid-connect/token
              <br />
              grant_type=client_credentials&client_id={credentials.clientId}
              &client_secret=***
            </code>
            <p>2. Usar o token nas requisições à API:</p>
            <code className="block bg-muted p-2 rounded text-xs font-mono">
              Authorization: Bearer &lt;access_token&gt;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
