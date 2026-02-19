/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useKeycloak } from "@/lib/keycloak";
import { useCredit } from "@/lib/credit-context";
import { ClientService } from "@/service/client/client-service";
import { Script, AnalysisRequest, AnalysisResult } from "@/types/analysis";
import { ClientResponse } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnalysisStepHeader } from "./analysis-step-header";
import { AnalysisFormValues } from "./analysis-form-types";
import { StepSelectScript } from "./step-select-script";
import { StepAnalysisData } from "./step-analysis-data";
import { StepScriptQuestions } from "./step-script-questions";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle,
  CheckIcon,
  XCircle,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Selecionar Script" },
  { id: 2, label: "Dados da Análise" },
  { id: 3, label: "Script" },
];

const stepTitles = [
  {
    title: "Selecionar Script",
    description: "Escolha o subtipo, tipo e script para a análise.",
  },
  {
    title: "Dados da Análise",
    description: "Selecione o cliente e envie o arquivo de áudio.",
  },
  {
    title: "Script",
    description: "Preencha as respostas esperadas para cada pergunta.",
  },
];

export function AnalysisForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [estimatedCredits, setEstimatedCredits] = useState<number | null>(null);
  const [isCalculatingCredits, setIsCalculatingCredits] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useKeycloak();
  const { refreshCredits } = useCredit();

  const form = useForm<AnalysisFormValues>({
    defaultValues: {
      serviceSubTypeId: "",
      serviceTypeId: "",
      scriptId: "",
      clientId: "",
      audioFile: undefined,
      answers: {},
    },
  });

  const loadClients = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setIsLoadingClients(true);
      const data = await ClientService.findAll(token);
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes. Por favor, tente novamente.");
    } finally {
      setIsLoadingClients(false);
    }
  }, [token]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleCreateClient = async (data: any) => {
    if (!token) {
      return;
    }

    try {
      const newClient = await ClientService.create(data, token);
      setClients((prev) => [...prev, newClient]);
      form.setValue("clientId", newClient.id);
      setIsClientDialogOpen(false);
      toast.success("Cliente criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Falha ao criar cliente");
      throw error;
    }
  };

  const handleScriptSelect = useCallback(
    (script: Script | null) => {
      setSelectedScript(script);
      setAnalysisResult(null);
      form.setValue("scriptId", script?.id ?? "");

      const initialAnswers: Record<string, string> = {};
      script?.scriptItems?.forEach((item) => {
        initialAnswers[item.id] = item.answer || "";
      });

      form.setValue("answers", initialAnswers, { shouldValidate: false });
    },
    [form],
  );

  const calculateDurationFromFile = async (
    file: File,
  ): Promise<number | null> => {
    return new Promise((resolve) => {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          resolve(audioBuffer.duration);
        } catch (error) {
          console.error("Erro ao decodificar áudio:", error);
          resolve(null);
        }
      };

      fileReader.onerror = () => {
        console.error("Erro ao ler arquivo");
        resolve(null);
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  const calculateEstimatedCredits = async (file: File) => {
    try {
      setIsCalculatingCredits(true);

      // Obter duração do arquivo usando Web Audio API
      const durationInSeconds = await calculateDurationFromFile(file);

      if (durationInSeconds === null) {
        toast.error("Não foi possível calcular a duração do áudio.");
        return null;
      }

      // Calcular créditos: 1 crédito por minuto (arredonda para cima)
      const estimatedCredits = Math.ceil(durationInSeconds / 60);

      return {
        durationInSeconds,
        estimatedCredits,
      };
    } catch (error) {
      console.error("Erro ao calcular créditos:", error);
      toast.error("Erro ao calcular custo estimado.");
      return null;
    } finally {
      setIsCalculatingCredits(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp3",
      "audio/ogg",
      "audio/m4a",
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)
    ) {
      toast.error(
        "Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, M4A)",
      );
      return;
    }

    form.setValue("audioFile", file);
    setAudioDuration(null);
    setEstimatedCredits(null);

    const result = await calculateEstimatedCredits(file);
    if (result) {
      setAudioDuration(result.durationInSeconds);
      setEstimatedCredits(result.estimatedCredits);
    }
  };

  const handleNext = async () => {
    if (currentStep === 3 && !selectedScript?.scriptItems?.length) {
      toast.error("Selecione um script para responder as perguntas.");
      return;
    }

    if (currentStep === 3) {
      const answers = form.getValues("answers") || {};
      const scriptItems = selectedScript?.scriptItems || [];
      const missingAnswers = scriptItems.filter(
        (item) => !answers[item.id]?.trim(),
      );

      form.clearErrors("answers");

      if (missingAnswers.length > 0) {
        missingAnswers.forEach((item) => {
          form.setError(`answers.${item.id}` as const, {
            type: "manual",
            message: "Resposta obrigatoria",
          });
        });
        return;
      }
    } else {
      const scriptId = form.getValues("scriptId").trim();
      const clientId = form.getValues("clientId").trim();
      const audioFile = form.getValues("audioFile");

      form.clearErrors(["scriptId", "clientId", "audioFile"]);

      if (currentStep === 1) {
        if (!scriptId) {
          form.setError("scriptId", {
            type: "manual",
            message: "Selecione um script",
          });
          return;
        }
      } else {
        if (!clientId) {
          form.setError("clientId", {
            type: "manual",
            message: "Selecione um cliente",
          });
        }
        if (!audioFile) {
          form.setError("audioFile", {
            type: "manual",
            message: "Selecione um arquivo de audio",
          });
        }

        if (!clientId || !audioFile) {
          return;
        }
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit(form.getValues());
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (values: AnalysisFormValues) => {
    if (!token) {
      toast.error("Você não está autenticado");
      return;
    }

    if (!selectedScript) {
      toast.error("Por favor, selecione um script");
      return;
    }

    if (!audioDuration) {
      toast.warning(
        "Aviso: Não foi possível calcular a duração do áudio localmente.",
      );
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      if (!values.audioFile) {
        throw new Error("Arquivo de áudio não selecionado");
      }

      const requestData: AnalysisRequest = {
        clientId: values.clientId,
        scriptId: values.scriptId,
        audioDuration: audioDuration ?? undefined,
        scriptItems:
          selectedScript.scriptItems?.map((item) => ({
            question: item.question,
            answer: values.answers[item.id]?.trim() || "",
          })) || [],
      };

      console.log("Enviando análise com dados:", {
        clientId: values.clientId,
        scriptId: values.scriptId,
        audioDuration,
        scriptItemsCount: requestData.scriptItems.length,
        audioFileName: values.audioFile.name,
      });

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(requestData)], {
          type: "application/json",
        }),
      );
      formData.append("file", values.audioFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/analyze/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Erro desconhecido";

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message || errorData.error || JSON.stringify(errorData);
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
        } else {
          errorMessage = await response
            .text()
            .catch(() => `Erro ${response.status}: ${response.statusText}`);
        }

        console.error("Erro na resposta:", errorMessage);
        throw new Error(`Erro ao realizar análise: ${errorMessage}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      toast.success("Análise realizada com sucesso!");
      await refreshCredits();
    } catch (error) {
      console.error("Erro na análise:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao realizar análise. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentStepMeta = stepTitles[currentStep - 1];

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleNext();
  };

  return (
    <div className="space-y-6">
      <Card className="w-full md:w-[70%] xl:w-[70%] max-w-4xl min-h-[87.5dvh] mx-auto border-border/50 shadow-lg ">
        <CardHeader className="pb-4 text-center">
          <div className="mb-8 mt-3 w-full flex items-center justify-center flex-col">
            <AnalysisStepHeader steps={STEPS} currentStep={currentStep} />
          </div>
          <CardTitle className="text-xl text-center">
            {currentStepMeta.title}
          </CardTitle>
          <CardDescription className="text-center">
            {currentStepMeta.description}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <StepSelectScript
                  form={form}
                  selectedScript={selectedScript}
                  onScriptSelect={handleScriptSelect}
                />
              )}

              {currentStep === 2 && (
                <StepAnalysisData
                  form={form}
                  clients={clients}
                  isLoadingClients={isLoadingClients}
                  isClientDialogOpen={isClientDialogOpen}
                  setIsClientDialogOpen={setIsClientDialogOpen}
                  onCreateClient={handleCreateClient}
                  fileInputRef={fileInputRef}
                  isCalculatingCredits={isCalculatingCredits}
                  onFileSelect={handleFileSelect}
                  audioDuration={audioDuration}
                  estimatedCredits={estimatedCredits}
                />
              )}

              {currentStep === 3 && (
                <StepScriptQuestions
                  form={form}
                  selectedScript={selectedScript}
                />
              )}
            </CardContent>
          </form>
        </Form>

        <CardFooter className="flex justify-between gap-4 pt-2 flex-col sm:flex-row mt-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isAnalyzing}
            className="gap-2 w-full sm:max-w-36"
            type="button"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="">Voltar</span>
          </Button>

          <Button
            onClick={handleNext}
            className="gap-2 w-full sm:max-w-36 flex flex-row items-center justify-center"
            variant={currentStep === STEPS.length ? "sectotech" : "default"}
            type="button"
            isLoading={isAnalyzing && currentStep === STEPS.length}
            disabled={isAnalyzing}
          >
            {currentStep === STEPS.length ? (
              <>
                <span className="">Finalizar</span>
                <CheckIcon className="size-4" />
              </>
            ) : (
              <>
                <span className="">Continuar</span>
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resultado da Análise
              <Badge
                variant={analysisResult.approved ? "default" : "destructive"}
              >
                {analysisResult.approved ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aprovado
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Reprovado
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.transcription && (
              <div>
                <Label className="text-sm font-medium">Transcrição</Label>
                <div className="p-3 bg-muted rounded-md mt-1">
                  <p className="text-sm">{analysisResult.transcription}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">
                Análise por Pergunta
              </Label>
              <div className="space-y-3 mt-2">
                {analysisResult.output.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Pergunta {index + 1}
                      </span>
                      <Badge variant={item.correct ? "default" : "destructive"}>
                        {item.correct ? "Correto" : "Incorreto"}
                      </Badge>
                    </div>
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
    </div>
  );
}
