"use client";

import { ClientResponse } from "@/types/client";
import { ClientForm } from "@/components/client-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";
import { CreditCard, Loader2, Plus, Upload, User } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="clientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente *</FormLabel>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingClients}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingClients
                            ? "Carregando clientes..."
                            : "Selecione um cliente"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {client.name} {client.surname}
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
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog
                open={isClientDialogOpen}
                onOpenChange={setIsClientDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="default">
                    <Plus className="w-4 h-4 mr-1" />
                    Novo Cliente
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isCalculatingCredits}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {form.getValues("audioFile")?.name ||
                    "Selecionar arquivo de audio"}
                  {isCalculatingCredits && (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={onFileSelect}
                  className="hidden"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(audioDuration !== null || isCalculatingCredits) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Custo da Analise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Duracao do audio:{" "}
                  <span className="font-medium">
                    {audioDuration != null
                      ? `${Math.floor(audioDuration / 60)}m ${Math.floor(audioDuration % 60)}s`
                      : "Calculando..."}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Taxa: 1 credito por minuto
                </p>
              </div>

              <div className="text-right">
                {isCalculatingCredits ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      Calculando...
                    </span>
                  </div>
                ) : estimatedCredits !== null ? (
                  <div className="space-y-1">
                    <Badge
                      variant="default"
                      className="text-base px-3 py-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {estimatedCredits}{" "}
                      {estimatedCredits === 1 ? "Credito" : "Creditos"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      serao descontados
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
