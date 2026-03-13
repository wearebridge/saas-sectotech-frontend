/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useKeycloak } from "@/lib/keycloak";
import { useCredit } from "@/lib/credit-context";
import { ClientService } from "@/service/client/client-service";
import { Script, AnalysisRequest, AnalysisResult } from "@/types/analysis";
import { ClientResponse, ClientFieldKey } from "@/types/client";
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
import { PhoneFormatter } from "@/lib/formatters/phone";
import { CPFFormatter } from "@/lib/formatters/cpf";

const STEPS = [
  { id: 1, label: "Selecionar Script" },
  { id: 2, label: "Script" },
  { id: 3, label: "Dados da Análise" },
];

const stepTitles = [
  {
    title: "Selecionar Script",
    description: "Escolha o subtipo, tipo, script e cliente para a análise.",
  },
  {
    title: "Script",
    description: "Preencha as respostas esperadas para cada pergunta.",
  },
  {
    title: "Análise do Áudio",
    description: "Envie o arquivo de áudio.",
  },
];

const isInsufficientCreditsMessage = (message: string) =>
  /insuficient|insufficient/i.test(message) &&
  /cr[eé]dito|credit/i.test(message);

const GENDER_LABELS: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

const formatClientBirthDate = (birthDate?: string) => {
  if (!birthDate) return "";
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return birthDate;
  return date.toLocaleDateString("pt-BR");
};

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
  const [serviceTypeName, setServiceTypeName] = useState<string>("");
  const [serviceSubTypeName, setServiceSubTypeName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { token } = useKeycloak();
  const { credits, loading: creditsLoading, refreshCredits } = useCredit();

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

  const getClientFieldValue = useCallback(
    (client: ClientResponse, field: ClientFieldKey): string => {
      const fieldMap: Record<ClientFieldKey, string | undefined> = {
        fullName: client.fullName,
        cpf: client.cpf ? CPFFormatter(client.cpf) : client.cpf,
        rg: client.rg,
        birthDate: formatClientBirthDate(client.birthDate),
        address: client.address,
        phone: client.phone ? PhoneFormatter(client.phone) : client.phone,
        email: client.email,
        gender: client.gender
          ? (GENDER_LABELS[client.gender] ?? client.gender)
          : undefined,
        yesResponse: "Sim",
        noResponse: "Não",
      };
      return fieldMap[field] || "";
    },
    [],
  );

  const clientId = form.watch("clientId");

  useEffect(() => {
    if (!clientId || !selectedScript?.scriptItems) return;

    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const currentAnswers = form.getValues("answers") || {};
    let hasChanges = false;

    selectedScript.scriptItems.forEach((item) => {
      if (item.linkedClientField) {
        const value = getClientFieldValue(client, item.linkedClientField);
        if (value && currentAnswers[item.id] !== value) {
          currentAnswers[item.id] = value;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      form.setValue(
        "answers",
        { ...currentAnswers },
        { shouldValidate: false },
      );
    }
  }, [clientId, selectedScript, clients, form, getClientFieldValue]);

  // Auto-fill predefined fields (yesResponse/noResponse) when script is selected
  useEffect(() => {
    if (!selectedScript?.scriptItems) return;

    const predefinedFields = ["yesResponse", "noResponse"];
    const currentAnswers = form.getValues("answers") || {};
    let hasChanges = false;

    selectedScript.scriptItems.forEach((item) => {
      if (
        item.linkedClientField &&
        predefinedFields.includes(item.linkedClientField)
      ) {
        const value = item.linkedClientField === "yesResponse" ? "Sim" : "Não";
        if (currentAnswers[item.id] !== value) {
          currentAnswers[item.id] = value;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      form.setValue(
        "answers",
        { ...currentAnswers },
        { shouldValidate: false },
      );
    }
  }, [selectedScript, form]);

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

  const calculateEstimatedCredits = async (file: File) => {
    try {
      setIsCalculatingCredits(true);

      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiUrl}/analyze/calculate-credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        toast.error("Não foi possível calcular o custo do áudio.");
        return null;
      }

      const data = await response.json();

      return {
        durationInSeconds: data.durationInSeconds as number,
        estimatedCredits: data.estimatedCredits as number,
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
      "audio/mp4",
      "video/mp4",
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|ogg|m4a|mp4)$/i)
    ) {
      toast.error(
        "Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, M4A, MP4)",
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
    // Step 1: Validar script e cliente
    if (currentStep === 1) {
      const scriptId = form.getValues("scriptId").trim();
      const clientId = form.getValues("clientId").trim();

      form.clearErrors(["scriptId", "clientId"]);

      let hasError = false;

      if (!scriptId) {
        form.setError("scriptId", {
          type: "manual",
          message: "Selecione um script",
        });
        hasError = true;
      }
      if (!clientId) {
        form.setError("clientId", {
          type: "manual",
          message: "Selecione um cliente",
        });
        hasError = true;
      }
      if (hasError) {
        return;
      }
    }

    // Step 2: Validar respostas do script
    if (currentStep === 2) {
      if (!selectedScript?.scriptItems?.length) {
        toast.error("Selecione um script para responder as perguntas.");
        return;
      }

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
    }

    // Step 3: Validar arquivo de áudio e fazer submit
    if (currentStep === 3) {
      const audioFile = form.getValues("audioFile");

      form.clearErrors("audioFile");

      if (!audioFile) {
        form.setError("audioFile", {
          type: "manual",
          message: "Selecione um arquivo de audio",
        });
        return;
      }
    }

    // Avançar para o próximo step ou fazer submit
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

    if (creditsLoading) {
      toast.error("Aguarde o carregamento dos créditos.");
      return;
    }

    if (credits <= 0) {
      toast.error("Créditos insuficientes para realizar a análise.");
      return;
    }

    if (estimatedCredits !== null && credits < estimatedCredits) {
      toast.error("Créditos insuficientes para realizar a análise.");
      return;
    }

    if (!selectedScript) {
      toast.error("Por favor, selecione um script");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const clientName =
      clients.find((c) => c.id === values.clientId)?.fullName || "Cliente";
    const scriptName = selectedScript.name || "Script";
    const serviceName = serviceTypeName || "Serviço";
    const subTypeName = serviceSubTypeName || "Subtipo";
    const loadingTitle = "Analisando Áudio";
    const loadingDescription = (
      <span>
        Estamos analisando o script <strong>{scriptName}</strong> do serviço{" "}
        <strong>{serviceName}</strong>, subtipo <strong>{subTypeName}</strong>,
        do cliente <strong>{clientName}</strong>.
      </span>
    );

    const analysisPromise = async () => {
      if (!values.audioFile) {
        throw new Error("Arquivo de áudio não selecionado");
      }

      const requestData: AnalysisRequest = {
        clientId: values.clientId,
        scriptId: values.scriptId,
        scriptItems:
          selectedScript.scriptItems?.map((item) => ({
            question: item.question,
            answer: values.answers[item.id]?.trim() || "",
          })) || [],
      };

      console.log("Enviando análise com dados:", {
        clientId: values.clientId,
        scriptId: values.scriptId,
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
        if (
          response.status === 402 ||
          isInsufficientCreditsMessage(errorMessage)
        ) {
          throw new Error("Créditos insuficientes para realizar a análise.");
        }

        throw new Error(`Erro ao realizar análise: ${errorMessage}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      await refreshCredits();
    };

    // Redirecionar imediatamente
    router.push("/historico");

    const toastId = toast.loading(loadingTitle, {
      description: loadingDescription,
    });

    try {
      await analysisPromise();
      toast.success("Analise concluida com sucesso!", { id: toastId });
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao concluir analise. Tente novamente.",
        { id: toastId },
      );
    } finally {
      setIsAnalyzing(false);
      router.refresh();
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
          {currentStep === 2 && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground text-xs mb-2">
                    Cliente
                  </span>
                  <span className="text-sm font-medium">
                    {clientId
                      ? clients.find((c) => c.id === clientId)?.fullName ||
                        "Não informado"
                      : "Não informado"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground text-xs mb-2">
                    Contato
                  </span>
                  <span className="text-sm font-medium">
                    {clientId
                      ? PhoneFormatter(
                          clients.find((c) => c.id === clientId)?.phone || "",
                        ) || "Não informado"
                      : "Não informado"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground text-xs mb-2">
                    Tipo de Serviço
                  </span>
                  <span className="text-sm font-medium">
                    {serviceTypeName || "Não informado"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground text-xs mb-2">
                    Subtipo
                  </span>
                  <span className="text-sm font-medium">
                    {serviceSubTypeName || "Não informado"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-muted-foreground text-xs mb-2">
                    Script
                  </span>
                  <span className="text-sm font-medium">
                    {selectedScript?.name || "Não informado"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <StepSelectScript
                  form={form}
                  selectedScript={selectedScript}
                  onScriptSelect={handleScriptSelect}
                  clients={clients}
                  isLoadingClients={isLoadingClients}
                  isClientDialogOpen={isClientDialogOpen}
                  setIsClientDialogOpen={setIsClientDialogOpen}
                  onCreateClient={handleCreateClient}
                  onServiceTypeNameChange={setServiceTypeName}
                  onServiceSubTypeNameChange={setServiceSubTypeName}
                />
              )}

              {currentStep === 2 && (
                <StepScriptQuestions
                  form={form}
                  selectedScript={selectedScript}
                />
              )}

              {currentStep === 3 && (
                <StepAnalysisData
                  form={form}
                  fileInputRef={fileInputRef}
                  isCalculatingCredits={isCalculatingCredits}
                  onFileSelect={handleFileSelect}
                  audioDuration={audioDuration}
                  estimatedCredits={estimatedCredits}
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
