"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface AnalysisStepHeaderProps {
  steps: Step[];
  currentStep: number;
}

export function AnalysisStepHeader({
  steps,
  currentStep,
}: AnalysisStepHeaderProps) {
  return (
    <div className="w-full flex items-start justify-between sm:max-w-[60%]">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLastStep = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start ",
              // Se não for o último, ocupa o espaço restante para esticar a linha
              !isLastStep ? "flex-1 w-full" : "",
            )}
          >
            {/* Conteúdo do Passo (Bolinha + Texto) */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-background text-primary scale-110",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/30 bg-background text-muted-foreground/50",
                )}
              >
                {isCompleted ? <CheckIcon className="size-4" /> : step.id}
              </div>

              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300 text-center whitespace-nowrap absolute top-8 left-1/2 -translate-x-1/2",
                  "hidden sm:block", // Esconde em mobile, mostra em sm+
                  isCurrent && "text-primary",
                  isCompleted && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground/50",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Linha Conectora */}
            {!isLastStep && (
              <div className="flex-1 h-0.5 mx-2 mt-3.5 bg-muted-foreground/15 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary transition-[width] duration-500 ease-out",
                    isCompleted ? "w-full" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
