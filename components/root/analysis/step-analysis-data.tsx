"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropAudio } from "@/components/common/drag-drop-audio";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";
import { CreditCard, Loader2 } from "lucide-react";

interface StepAnalysisDataProps {
  form: UseFormReturn<AnalysisFormValues>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isCalculatingCredits: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  audioDuration: number | null;
  estimatedCredits: number | null;
}

export function StepAnalysisData({
  form,
  fileInputRef,
  isCalculatingCredits,
  onFileSelect,
  audioDuration,
  estimatedCredits,
}: StepAnalysisDataProps) {
  return (
    <div className="flex flex-col gap-5 mb-3">
      <FormField
        control={form.control}
        name="audioFile"
        render={() => (
          <FormItem>
            <FormLabel>Arquivo de Audio *</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <DragDropAudio
                  fileInputRef={fileInputRef}
                  onFileSelect={onFileSelect}
                  isCalculatingCredits={isCalculatingCredits}
                  selectedFileName={form.getValues("audioFile")?.name}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(audioDuration !== null || isCalculatingCredits) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              Custo da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Duração do áudio:{" "}
                  <span className="font-medium text-foreground">
                    {audioDuration != null
                      ? `${Math.floor(audioDuration / 60)}m ${Math.floor(audioDuration % 60)}s`
                      : "Calculando..."}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Taxa: 1 crédito por minuto
                </p>
              </div>

              <div className="text-left mt-2 sm:mt-0 md:text-right">
                {isCalculatingCredits ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span className="text-sm text-muted-foreground">
                      Calculando...
                    </span>
                  </div>
                ) : estimatedCredits !== null ? (
                  <div className="space-y-1">
                    <Badge className="text-base px-3 py-1 bg-brand text-white">
                      {estimatedCredits.toFixed(1)}{" "}
                      {estimatedCredits === 1 ? "Crédito" : "Créditos"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      serão descontados
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
