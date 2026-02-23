"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconDownload, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

import { AnalysisItem } from "@/types/analysis";
import { CustomError } from "@/lib/errors/custom-errors";
import { useKeycloak } from "@/lib/keycloak";
import { getAnalysisById, regenerateAnalysis } from "@/service/analysis";
import { useCredit } from "@/lib/credit-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAnalysisItem = (item: any): AnalysisItem => ({
  id: item.id,
  date: new Date(item.createdAt),
  clientId: item.clientId,
  clientName: item.clientName || "-",
  clientCpf: item.clientCpf,
  service: item.serviceTypeName || "-",
  subType: item.serviceSubTypeName || "-",
  scriptName: item.scriptName,
  approved: item.approved,
  creditsUsed: item.creditsUsed,
  executedBy: item.executedBy,
  audioFilename: item.audioFilename,
  audioUrl: item.audioUrl,
  transcription: item.transcription,
  aiOutput: item.aiOutput,
});

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, authenticated } = useKeycloak();
  const { refreshCredits } = useCredit();
  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const analysisId = params.id as string;

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!token || !analysisId) return;

      setLoading(true);
      setNotFound(false);

      try {
        const result = await getAnalysisById({ id: analysisId, token });

        if (result instanceof CustomError) {
          if (result.statusCode === 404) {
            setNotFound(true);
            return;
          }
          throw result;
        }

        setAnalysis(mapAnalysisItem(result));
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar detalhes da análise");
      } finally {
        setLoading(false);
      }
    };

    if (authenticated) {
      loadAnalysis();
    }
  }, [analysisId, token, authenticated]);

  const handleRegenerate = async () => {
    if (!token || !analysisId) return;

    setRegenerating(true);
    const toastId = toast.loading("Re-gerando análise...");

    try {
      const result = await regenerateAnalysis({ id: analysisId, token });

      if (result instanceof CustomError) {
        toast.error(result.message, { id: toastId });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newAnalysis = result as any;
      toast.success("Análise re-gerada com sucesso!", { id: toastId });
      refreshCredits();

      // Navigate to the new analysis detail
      if (newAnalysis?.id && newAnalysis.id !== analysisId) {
        router.push(`/historico/detalhes/${newAnalysis.id}`);
      } else {
        // Reload current analysis
        setAnalysis(mapAnalysisItem(newAnalysis));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao re-gerar a análise", { id: toastId });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadAudio = (item: AnalysisItem) => {
    if (!item.audioUrl) {
      toast.error("Nenhum áudio disponível para esta análise");
      return;
    }
    const link = document.createElement("a");
    link.href = item.audioUrl;
    link.download = item.audioFilename || "audio";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!loading && notFound) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Análise não encontrada
            </h1>
            <p className="text-muted-foreground">
              Verifique se o identificador está correto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-10" />
              ))}
            </div>
          ) : (
            <>
              <h3 className="font-semibold mb-3">Resumo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Data
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.date
                      ? format(analysis.date, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Executado por
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.executedBy || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Cliente
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.clientName || "-"}
                    {analysis?.clientCpf && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {analysis.clientCpf.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          "$1.$2.$3-$4",
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Créditos utilizados
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.creditsUsed != null
                      ? analysis.creditsUsed.toFixed(1)
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Serviço
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.service || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Sub-tipo
                  </Label>
                  <p className="text-sm font-medium">
                    {analysis?.subType || "-"}
                  </p>
                </div>
                {analysis?.scriptName && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Script
                    </Label>
                    <p className="text-sm font-medium">{analysis.scriptName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Resultado
                  </Label>
                  {analysis && (
                    <Badge
                      variant={analysis.approved ? "default" : "destructive"}
                      className="mt-1"
                    >
                      {analysis.approved ? "Aprovado" : "Reprovado"}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>

        {!loading && analysis && (
          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <IconRefresh
                className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
              />
              {regenerating ? "Re-gerando..." : "Re-gerar Análise"}
            </Button>
            {analysis.audioUrl && (
              <Button
                variant="outline"
                onClick={() => handleDownloadAudio(analysis)}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Baixar Áudio
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {!loading && analysis && (
        <>
          {analysis.transcription && (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Transcrição</h3>
                  <div className="rounded-md bg-muted p-3 max-h-72 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {analysis.transcription}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.aiOutput?.output && analysis.aiOutput.output.length > 0 && (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Análise por Pergunta</h3>
                  <div className="space-y-3">
                    {analysis.aiOutput.output.map((item, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Pergunta {index + 1}
                          </span>
                          <Badge
                            variant={item.correct ? "default" : "destructive"}
                          >
                            {item.correct ? "Correto" : "Incorreto"}
                          </Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Pergunta:
                            </span>
                            <p className="text-sm">{item.question}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Resposta:
                            </span>
                            <p className="text-sm">{item.answer}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Análise:
                            </span>
                            <p className="text-sm">{item.analysis}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
