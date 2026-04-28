"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconDownload, IconRefresh, IconShieldCheck, IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";

import { AnalysisItem } from "@/types/analysis";
import { CustomError } from "@/lib/errors/custom-errors";
import { useKeycloak } from "@/lib/keycloak";
import { getAnalysisById, regenerateAnalysis, getAudioDownloadUrl, overrideAnalysisQuestion } from "@/service/analysis";
import { useCredit } from "@/lib/credit-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const isInsufficientCreditsMessage = (message: string) =>
  /insuficient|insufficient/i.test(message) &&
  /cr[eé]dito|credit/i.test(message);

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, authenticated, isCompanyAdmin } = useKeycloak();
  const { credits, loading: creditsLoading, refreshCredits } = useCredit();
  const [analysis, setAnalysis] = useState<AnalysisItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [overriding, setOverriding] = useState<number | null>(null);

  const analysisId = params.id as string;

  const handleOverride = async (
    questionIndex: number,
    field: "correct" | "questionAsked",
    currentValue: boolean,
  ) => {
    if (!token || !analysisId || overriding !== null) return;

    setOverriding(questionIndex);
    try {
      const payload: {
        id: string;
        questionIndex: number;
        correct?: boolean;
        questionAsked?: boolean;
        token: string;
      } = { id: analysisId, questionIndex, token };

      payload[field] = !currentValue;

      const result = await overrideAnalysisQuestion(payload);

      if (result instanceof CustomError) {
        toast.error(result.message || "Erro ao corrigir a questão");
        return;
      }

      setAnalysis(mapAnalysisItem(result));
      toast.success("Questão corrigida com sucesso");
    } catch {
      toast.error("Erro ao corrigir a questão");
    } finally {
      setOverriding(null);
    }
  };

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

    if (creditsLoading) {
      toast.error("Aguarde o carregamento dos créditos.");
      return;
    }

    if (credits <= 0) {
      toast.error("Créditos insuficientes para re-gerar a análise.");
      return;
    }

    if (analysis?.creditsUsed != null && credits < analysis.creditsUsed) {
      toast.error("Créditos insuficientes para re-gerar a análise.");
      return;
    }

    setRegenerating(true);
    const clientName = analysis?.clientName || "Cliente";
    const scriptName = analysis?.scriptName || "Script";
    const serviceName = analysis?.service || "Serviço";
    const subTypeName = analysis?.subType || "Subtipo";
    const loadingDescription = (
      <span>
        Estamos analisando o script <strong>{scriptName}</strong> do serviço{" "}
        <strong>{serviceName}</strong>, subtipo <strong>{subTypeName}</strong>,
        do cliente <strong>{clientName}</strong>.
      </span>
    );

    const toastId = toast.loading("Gerando novamente", {
      description: loadingDescription,
    });

    try {
      const result = await regenerateAnalysis({ id: analysisId, token });

      if (result instanceof CustomError) {
        if (isInsufficientCreditsMessage(result.message)) {
          toast.error("Créditos insuficientes para re-gerar a análise.", {
            id: toastId,
          });
          return;
        }

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

  const handleDownloadAudio = async (item: AnalysisItem) => {
    if (!item.audioFilename) {
      toast.error("Nenhum áudio disponível para esta análise");
      return;
    }
    if (!token) {
      toast.error("Você não está autenticado");
      return;
    }

    const result = await getAudioDownloadUrl({ id: item.id, token });
    if (typeof result !== "string") {
      toast.error("Falha ao gerar URL de download do áudio");
      return;
    }

    const ext = item.audioFilename?.split(".").pop() || "mp3";
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `listen-${item.id}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Falha ao baixar o áudio");
    }
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
                  {analysis && (() => {
                    const hasOverrides = analysis.aiOutput?.output?.some(item => item.adminOverride);
                    const effectiveApproved = hasOverrides
                      ? analysis.aiOutput!.output!.every(item => {
                          const eff = item.adminOverride?.correct ?? item.correct;
                          return eff;
                        })
                      : analysis.approved;
                    return (
                      <Badge
                        variant={effectiveApproved ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {effectiveApproved ? "Aprovado" : "Reprovado"}
                      </Badge>
                    );
                  })()}
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
            {isCompanyAdmin && analysis.audioUrl && (
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
                  {isCompanyAdmin && (
                    <div className="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      <IconPencil className="h-4 w-4 shrink-0" />
                      <span>Como administrador, você pode clicar nos badges para corrigir o resultado da IA.</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <TooltipProvider>
                    {analysis.aiOutput.output.map((item, index) => {
                      const effectiveQuestionAsked = item.adminOverride?.questionAsked ?? item.questionAsked;
                      const effectiveCorrect = item.adminOverride?.correct ?? item.correct;
                      const hasOverride = !!item.adminOverride;

                      return (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Pergunta {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {isCompanyAdmin ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={overriding !== null}
                                    onClick={() => handleOverride(index, "questionAsked", effectiveQuestionAsked)}
                                    className="inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 rounded-md hover:ring-2 hover:ring-blue-300 transition-all"
                                  >
                                    <Badge
                                      variant={effectiveQuestionAsked ? "outline" : "destructive"}
                                      className={
                                        effectiveQuestionAsked
                                          ? `border-green-500 text-green-700 ${item.adminOverride?.questionAsked !== undefined ? "border-dashed" : ""}`
                                          : item.adminOverride?.questionAsked !== undefined ? "border-dashed border" : ""
                                      }
                                    >
                                      {item.adminOverride?.questionAsked !== undefined && (
                                        <IconShieldCheck className="mr-1 h-3 w-3" />
                                      )}
                                      {effectiveQuestionAsked ? "Pergunta feita" : "Pergunta não feita"}
                                    </Badge>
                                    <IconPencil className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.adminOverride?.questionAsked !== undefined ? (
                                    <div className="space-y-1 text-xs max-w-[220px]">
                                      <p><span className="font-medium">IA original:</span> {item.questionAsked ? "Pergunta feita" : "Pergunta não feita"}</p>
                                      <p><span className="font-medium">Corrigido para:</span> {effectiveQuestionAsked ? "Pergunta feita" : "Pergunta não feita"}</p>
                                      <p><span className="font-medium">Por:</span> {item.adminOverride.overriddenBy}</p>
                                      <p><span className="font-medium">Em:</span> {new Date(item.adminOverride.overriddenAt).toLocaleString("pt-BR")}</p>
                                      <p className="border-t pt-1 mt-1 text-muted-foreground">Clique para alternar novamente</p>
                                    </div>
                                  ) : (
                                    <p>Clique para alternar para &quot;{effectiveQuestionAsked ? "Pergunta não feita" : "Pergunta feita"}&quot;</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : item.adminOverride?.questionAsked !== undefined ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant={effectiveQuestionAsked ? "outline" : "destructive"}
                                    className={
                                      effectiveQuestionAsked
                                        ? "border-green-500 text-green-700 border-dashed cursor-help"
                                        : "border-dashed border cursor-help"
                                    }
                                  >
                                    <IconShieldCheck className="mr-1 h-3 w-3" />
                                    {effectiveQuestionAsked ? "Pergunta feita" : "Pergunta não feita"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-xs max-w-[220px]">
                                    <p><span className="font-medium">IA original:</span> {item.questionAsked ? "Pergunta feita" : "Pergunta não feita"}</p>
                                    <p><span className="font-medium">Corrigido para:</span> {effectiveQuestionAsked ? "Pergunta feita" : "Pergunta não feita"}</p>
                                    <p><span className="font-medium">Por:</span> {item.adminOverride.overriddenBy}</p>
                                    <p><span className="font-medium">Em:</span> {new Date(item.adminOverride.overriddenAt).toLocaleString("pt-BR")}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Badge
                                variant={effectiveQuestionAsked ? "outline" : "destructive"}
                                className={
                                  effectiveQuestionAsked ? "border-green-500 text-green-700" : ""
                                }
                              >
                                {effectiveQuestionAsked ? "Pergunta feita" : "Pergunta não feita"}
                              </Badge>
                            )}

                            {isCompanyAdmin ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    disabled={overriding !== null}
                                    onClick={() => handleOverride(index, "correct", effectiveCorrect)}
                                    className="inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 rounded-md hover:ring-2 hover:ring-blue-300 transition-all"
                                  >
                                    <Badge
                                      variant={effectiveCorrect ? "default" : "destructive"}
                                      className={item.adminOverride?.correct !== undefined ? "border-dashed border" : ""}
                                    >
                                      {item.adminOverride?.correct !== undefined && (
                                        <IconShieldCheck className="mr-1 h-3 w-3" />
                                      )}
                                      {effectiveCorrect ? "Correto" : "Incorreto"}
                                    </Badge>
                                    <IconPencil className="h-3.5 w-3.5 text-muted-foreground" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.adminOverride?.correct !== undefined ? (
                                    <div className="space-y-1 text-xs max-w-[220px]">
                                      <p><span className="font-medium">IA original:</span> {item.correct ? "Correto" : "Incorreto"}</p>
                                      <p><span className="font-medium">Corrigido para:</span> {effectiveCorrect ? "Correto" : "Incorreto"}</p>
                                      <p><span className="font-medium">Por:</span> {item.adminOverride.overriddenBy}</p>
                                      <p><span className="font-medium">Em:</span> {new Date(item.adminOverride.overriddenAt).toLocaleString("pt-BR")}</p>
                                      <p className="border-t pt-1 mt-1 text-muted-foreground">Clique para alternar novamente</p>
                                    </div>
                                  ) : (
                                    <p>Clique para alternar para &quot;{effectiveCorrect ? "Incorreto" : "Correto"}&quot;</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : item.adminOverride?.correct !== undefined ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant={effectiveCorrect ? "default" : "destructive"}
                                    className="border-dashed border cursor-help"
                                  >
                                    <IconShieldCheck className="mr-1 h-3 w-3" />
                                    {effectiveCorrect ? "Correto" : "Incorreto"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-xs max-w-[220px]">
                                    <p><span className="font-medium">IA original:</span> {item.correct ? "Correto" : "Incorreto"}</p>
                                    <p><span className="font-medium">Corrigido para:</span> {effectiveCorrect ? "Correto" : "Incorreto"}</p>
                                    <p><span className="font-medium">Por:</span> {item.adminOverride.overriddenBy}</p>
                                    <p><span className="font-medium">Em:</span> {new Date(item.adminOverride.overriddenAt).toLocaleString("pt-BR")}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Badge
                                variant={effectiveCorrect ? "default" : "destructive"}
                              >
                                {effectiveCorrect ? "Correto" : "Incorreto"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Pergunta do script:
                            </span>
                            <p className="text-sm">{item.question}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Resposta encontrada:
                            </span>
                            <p className="text-sm">{item.answer}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">
                              Análise:
                            </span>
                            <p className="text-sm">{item.analysis}</p>
                          </div>
                          {hasOverride && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
                              <IconShieldCheck className="h-3.5 w-3.5" />
                              <span>
                                Corrigido por <strong>{item.adminOverride!.overriddenBy}</strong> em{" "}
                                {new Date(item.adminOverride!.overriddenAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                    </TooltipProvider>
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
