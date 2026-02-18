"use client";

import { Script } from "@/types/analysis";
import { ScriptSelector } from "@/components/script-selector";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";

interface StepSelectScriptProps {
  form: UseFormReturn<AnalysisFormValues>;
  selectedScript: Script | null;
  onScriptSelect: (script: Script | null) => void;
}

export function StepSelectScript({
  form,
  selectedScript,
  onScriptSelect,
}: StepSelectScriptProps) {
  return (
    <div className="space-y-4">
      <ScriptSelector
        onScriptSelect={onScriptSelect}
        selectedScript={selectedScript}
      />
      <FormField
        control={form.control}
        name="scriptId"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
