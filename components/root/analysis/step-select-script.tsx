/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Script } from "@/types/analysis";
import { ClientResponse } from "@/types/client";
import { ScriptSelector } from "@/components/root/analysis/script-selector";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";

interface StepSelectScriptProps {
  form: UseFormReturn<AnalysisFormValues>;
  selectedScript: Script | null;
  onScriptSelect: (script: Script | null) => void;
  clients: ClientResponse[];
  isLoadingClients: boolean;
  isClientDialogOpen: boolean;
  setIsClientDialogOpen: (open: boolean) => void;
  onCreateClient: (data: any) => Promise<void>;
  onServiceTypeNameChange?: (name: string) => void;
  onServiceSubTypeNameChange?: (name: string) => void;
}

export function StepSelectScript({
  form,
  selectedScript,
  onScriptSelect,
  clients,
  isLoadingClients,
  isClientDialogOpen,
  setIsClientDialogOpen,
  onCreateClient,
  onServiceTypeNameChange,
  onServiceSubTypeNameChange,
}: StepSelectScriptProps) {
  const selectedServiceSubTypeId = form.watch("serviceSubTypeId");
  const selectedServiceTypeId = form.watch("serviceTypeId");

  const handleServiceSubTypeChange = (serviceSubTypeId: string) => {
    form.setValue("serviceSubTypeId", serviceSubTypeId);
    form.setValue("serviceTypeId", "");
    form.setValue("scriptId", "");
    onScriptSelect(null);
  };

  const handleServiceTypeChange = (serviceTypeId: string) => {
    form.setValue("serviceTypeId", serviceTypeId);
    form.setValue("scriptId", "");
    onScriptSelect(null);
  };

  const handleClientChange = (clientId: string) => {
    form.setValue("clientId", clientId);
  };

  return (
    <div className="space-y-4">
      <ScriptSelector
        onScriptSelect={onScriptSelect}
        selectedScript={selectedScript}
        selectedServiceSubTypeId={selectedServiceSubTypeId}
        selectedServiceTypeId={selectedServiceTypeId}
        onServiceSubTypeChange={handleServiceSubTypeChange}
        onServiceTypeChange={handleServiceTypeChange}
        clients={clients}
        isLoadingClients={isLoadingClients}
        selectedClientId={form.watch("clientId")}
        onClientChange={handleClientChange}
        isClientDialogOpen={isClientDialogOpen}
        setIsClientDialogOpen={setIsClientDialogOpen}
        onCreateClient={onCreateClient}
        form={form}
        onServiceTypeNameChange={onServiceTypeNameChange}
        onServiceSubTypeNameChange={onServiceSubTypeNameChange}
      />
    </div>
  );
}
