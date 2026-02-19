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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HelpCircle className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">
          Selecione um script para responder as perguntas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedScript.scriptItems.map((item, index) => (
        <Card key={item.id} className="border-border/50">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                  {index + 1}
                </Badge>
                <span>Pergunta</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="p-3 bg-muted rounded-lg border border-border/30">
              <p className="text-sm text-foreground">{item.question}</p>
            </div>

            <FormField
              control={form.control}
              name={`answers.${item.id}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Resposta Esperada *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Digite a resposta esperada para esta pergunta"
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
