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
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex flex-1 items-center w-full">
            <div className="flex flex-col items-center w-36 gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 h-7",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-background text-primary scale-110",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/30 bg-background text-muted-foreground/50",
                )}
              >
                {isCompleted ? <CheckIcon className="size-5" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300 hidden sm:block",
                  isCurrent && "text-primary",
                  isCompleted && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground/50",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="relative w-36 h-0.5 mx-2 flex-1 self-start mt-5 overflow-hidden rounded-full bg-muted-foreground/15">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out",
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
