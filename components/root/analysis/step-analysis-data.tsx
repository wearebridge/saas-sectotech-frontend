"use client";

import { useState } from "react";
import { ClientResponse } from "@/types/client";
import { ClientForm } from "@/components/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropAudio } from "@/components/common/drag-drop-audio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CreditCard, Loader2, Plus, User } from "lucide-react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface StepAnalysisDataProps {
  form: UseFormReturn<AnalysisFormValues>;
  clients: ClientResponse[];
  isLoadingClients: boolean;
  isClientDialogOpen: boolean;
  setIsClientDialogOpen: (open: boolean) => void;
  onCreateClient: (data: any) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isCalculatingCredits: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  audioDuration: number | null;
  estimatedCredits: number | null;
}

export function StepAnalysisData({
  form,
  clients,
  isLoadingClients,
  isClientDialogOpen,
  setIsClientDialogOpen,
  onCreateClient,
  fileInputRef,
  isCalculatingCredits,
  onFileSelect,
  audioDuration,
  estimatedCredits,
}: StepAnalysisDataProps) {
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);

  const selectedClient = clients.find(
    (client) => client.id === form.getValues("clientId"),
  );

  return (
    <div className="flex flex-col gap-5 mb-3">
      <FormField
        control={form.control}
        name="clientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente *</FormLabel>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-row gap-2 w-full">
                <div className="flex-1">
                  {isLoadingClients ? (
                    <div className="h-8 w-full flex items-center justify-center border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Popover
                      open={isClientSelectOpen}
                      onOpenChange={setIsClientSelectOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex h-9 w-full items-center justify-between text-sm",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <span className="truncate">
                            {selectedClient
                              ? `${selectedClient.fullName}`
                              : "Selecione um cliente"}
                          </span>
                          <IconChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar por cliente..." />
                          <CommandEmpty>Nenhum resultado.</CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={`${client.fullName}`}
                                className="cursor-pointer"
                                onSelect={() => {
                                  field.onChange(client.id);
                                  setIsClientSelectOpen(false);
                                }}
                              >
                                <IconCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === client.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span className="text-sm">
                                    {client.fullName}
                                  </span>
                                  {client.cpf && (
                                    <span className="text-xs text-muted-foreground">
                                      - CPF:{" "}
                                      {client.cpf.replace(
                                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                        "$1.$2.$3-$4",
                                      )}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <Dialog
                  open={isClientDialogOpen}
                  onOpenChange={setIsClientDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="md:size-auto md:px-4"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline ml-1">
                        Novo Cliente
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Cliente</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                      onSubmit={onCreateClient}
                      onCancel={() => setIsClientDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

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
