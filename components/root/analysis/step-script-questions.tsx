"use client";

import { Script } from "@/types/analysis";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface StepScriptQuestionsProps {
  form: UseFormReturn<AnalysisFormValues>;
  selectedScript: Script | null;
}

export function StepScriptQuestions({
  form,
  selectedScript,
}: StepScriptQuestionsProps) {
  if (!selectedScript?.scriptItems?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Selecione um script para responder as perguntas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {selectedScript.scriptItems.map((item, index) => (
        <div key={item.id} className="space-y-2">
          <Label className="text-sm font-medium">Pergunta {index + 1}</Label>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{item.question}</p>
          </div>
          <FormField
            control={form.control}
            name={`answers.${item.id}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resposta Esperada *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Digite a resposta esperada para esta pergunta"
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {index < selectedScript.scriptItems.length - 1 && (
            <Separator className="mt-4" />
          )}
        </div>
      ))}
    </div>
  );
}
