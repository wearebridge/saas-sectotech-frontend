"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useKeycloak } from "@/lib/keycloak";
import { Script, ServiceType, ServiceSubType } from "@/types/analysis";
import { ClientResponse } from "@/types/client";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors/error-utils";
import { getSubTypeService } from "@/service/services-sub-type";
import { getServices } from "@/service/services-type";
import { getScripts } from "@/service/scripts";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
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
import { Loader2, Plus, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/root/clients/client-form";
import { UseFormReturn } from "react-hook-form";
import { AnalysisFormValues } from "./analysis-form-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface ScriptSelectorProps {
  onScriptSelect: (script: Script | null) => void;
  selectedScript: Script | null;
  selectedServiceSubTypeId: string;
  selectedServiceTypeId: string;
  onServiceSubTypeChange: (serviceSubTypeId: string) => void;
  onServiceTypeChange: (serviceTypeId: string) => void;
  clients: ClientResponse[];
  isLoadingClients: boolean;
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  isClientDialogOpen: boolean;
  setIsClientDialogOpen: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreateClient: (data: any) => Promise<void>;
  form: UseFormReturn<AnalysisFormValues>;
  onServiceTypeNameChange?: (name: string) => void;
  onServiceSubTypeNameChange?: (name: string) => void;
}

export function ScriptSelector({
  onScriptSelect,
  selectedScript,
  selectedServiceSubTypeId,
  selectedServiceTypeId,
  onServiceSubTypeChange,
  onServiceTypeChange,
  clients,
  isLoadingClients,
  selectedClientId,
  onClientChange,
  isClientDialogOpen,
  setIsClientDialogOpen,
  onCreateClient,
  form,
  onServiceTypeNameChange,
  onServiceSubTypeNameChange,
}: ScriptSelectorProps) {
  const [isSubTypeOpen, setIsSubTypeOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceSubTypes, setServiceSubTypes] = useState<ServiceSubType[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingScripts, setIsLoadingScripts] = useState(false);
  const { token, authenticated } = useKeycloak();

  const sortedClients = useMemo(
    () =>
      [...clients].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "pt-BR", {
          sensitivity: "base",
        }),
      ),
    [clients],
  );

  const fetchingRef = useRef(false);

  const handleGetServiceSubType = useCallback(async () => {
    if (!token) return;

    setIsLoadingSubTypes(true);
    try {
      const result = await getSubTypeService({ token: token });

      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }

      setServiceSubTypes(result as ServiceSubType[]);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar subtipos de serviço");
    } finally {
      setIsLoadingSubTypes(false);
    }
  }, [token]);

  const handleGetServiceTypes = useCallback(
    async (serviceSubTypeId: string) => {
      if (!token || !serviceSubTypeId || fetchingRef.current) return;

      setIsLoadingTypes(true);
      fetchingRef.current = true;
      try {
        const result = await getServices({ serviceSubTypeId, token });

        const errorMessage = getErrorMessage(result);
        if (errorMessage) {
          toast.error(errorMessage);
          return;
        }

        setServiceTypes(result as ServiceType[]);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar tipos de serviço");
      } finally {
        setIsLoadingTypes(false);
        fetchingRef.current = false;
      }
    },
    [token],
  );

  const handleGetScripts = useCallback(
    async (serviceTypeId: string) => {
      if (!token || !serviceTypeId || fetchingRef.current) return;

      setIsLoadingScripts(true);
      fetchingRef.current = true;
      try {
        const result = await getScripts({ token, serviceTypeId });

        const errorMessage = getErrorMessage(result);
        if (errorMessage) {
          toast.error(errorMessage);
          setIsLoadingScripts(false);
          fetchingRef.current = false;
          return;
        }

        setScripts(result as Script[]);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar scripts");
      } finally {
        setIsLoadingScripts(false);
        fetchingRef.current = false;
      }
    },
    [token],
  );

  useEffect(() => {
    if (authenticated) {
      handleGetServiceSubType();
    }
  }, [authenticated, handleGetServiceSubType]);

  useEffect(() => {
    if (selectedServiceSubTypeId) {
      setServiceTypes([]);
      setScripts([]);
      handleGetServiceTypes(selectedServiceSubTypeId);
    }
  }, [selectedServiceSubTypeId, handleGetServiceTypes]);

  useEffect(() => {
    if (selectedServiceTypeId) {
      setScripts([]);
      handleGetScripts(selectedServiceTypeId);
    }
  }, [selectedServiceTypeId, handleGetScripts]);

  const handleScriptSelect = useCallback(
    (scriptId: string) => {
      const script = scripts.find((s) => s.id === scriptId);
      onScriptSelect(script || null);
    },
    [scripts, onScriptSelect],
  );

  const handleServiceTypeChange = useCallback(
    (serviceTypeId: string) => {
      onServiceTypeChange(serviceTypeId);
    },
    [onServiceTypeChange],
  );

  const handleServiceSubTypeChange = useCallback(
    (serviceSubTypeId: string) => {
      onServiceSubTypeChange(serviceSubTypeId);
    },
    [onServiceSubTypeChange],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Subtipo de Serviço</label>
        <FormField
          control={form.control}
          name="serviceSubTypeId"
          render={() => (
            <FormItem>
              <FormControl>
                {isLoadingSubTypes ? (
                  <div className="h-8 w-full flex items-center justify-center border rounded-md">
                    <Loader size={5} />
                  </div>
                ) : (
                  <Popover open={isSubTypeOpen} onOpenChange={setIsSubTypeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex h-9 w-full items-center justify-between text-sm",
                          !selectedServiceSubTypeId && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate text-left flex-1">
                          {selectedServiceSubTypeId
                            ? serviceSubTypes.find(
                                (subType) =>
                                  subType.id === selectedServiceSubTypeId,
                              )?.name
                            : "Selecione um subtipo de serviço"}
                        </span>
                        <IconChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar por subtipo..." />
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {serviceSubTypes
                            .filter((subType) => subType.status)
                            .map((subType) => (
                              <CommandItem
                                key={subType.id}
                                value={subType.id}
                                keywords={[subType.name]}
                                className="cursor-pointer"
                                onSelect={() => {
                                  handleServiceSubTypeChange(
                                    selectedServiceSubTypeId === subType.id
                                      ? ""
                                      : subType.id,
                                  );
                                  if (selectedServiceSubTypeId !== subType.id) {
                                    onServiceSubTypeNameChange?.(subType.name);
                                  }
                                  setIsSubTypeOpen(false);
                                }}
                              >
                                <IconCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedServiceSubTypeId === subType.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <span className="text-sm">{subType.name}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Tipo de Serviço</label>
        <FormField
          control={form.control}
          name="serviceTypeId"
          render={() => (
            <FormItem>
              <FormControl>
                {isLoadingTypes ? (
                  <div className="h-8 w-full flex items-center justify-center border rounded-md">
                    <Loader size={5} />
                  </div>
                ) : (
                  <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex h-9 w-full items-center justify-between text-sm",
                          !selectedServiceTypeId && "text-muted-foreground",
                        )}
                        disabled={!selectedServiceSubTypeId}
                      >
                        <span className="truncate text-left flex-1">
                          {selectedServiceTypeId
                            ? serviceTypes.find(
                                (type) => type.id === selectedServiceTypeId,
                              )?.name
                            : selectedServiceSubTypeId
                              ? "Selecione um tipo de serviço"
                              : "Selecione um subtipo primeiro"}
                        </span>
                        <IconChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar por tipo..." />
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {serviceTypes
                            .filter((type) => type.status)
                            .map((type) => (
                              <CommandItem
                                key={type.id}
                                value={type.id}
                                keywords={[type.name]}
                                className="cursor-pointer"
                                onSelect={() => {
                                  handleServiceTypeChange(
                                    selectedServiceTypeId === type.id
                                      ? ""
                                      : type.id,
                                  );
                                  if (selectedServiceTypeId !== type.id) {
                                    onServiceTypeNameChange?.(type.name);
                                  }
                                  setIsTypeOpen(false);
                                }}
                              >
                                <IconCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedServiceTypeId === type.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <span className="text-sm">{type.name}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Script</label>
        <FormField
          control={form.control}
          name="scriptId"
          render={() => (
            <FormItem>
              <FormControl>
                {isLoadingScripts ? (
                  <div className="h-8 w-full flex items-center justify-center border rounded-md">
                    <Loader size={5} />
                  </div>
                ) : (
                  <Popover open={isScriptOpen} onOpenChange={setIsScriptOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex h-9 w-full items-center justify-between text-sm",
                          !selectedScript?.id && "text-muted-foreground",
                        )}
                        disabled={!selectedServiceTypeId}
                      >
                        <span className="truncate text-left flex-1">
                          {selectedScript?.name
                            ? selectedScript.name
                            : selectedServiceTypeId
                              ? "Selecione um script"
                              : "Selecione um tipo primeiro"}
                        </span>
                        <IconChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar por script..." />
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {scripts
                            .filter((script) => script.status)
                            .map((script) => (
                              <CommandItem
                                key={script.id}
                                value={script.id}
                                keywords={[script.name]}
                                className="cursor-pointer"
                                onSelect={() => {
                                  handleScriptSelect(script.id);
                                  setIsScriptOpen(false);
                                }}
                              >
                                <IconCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedScript?.id === script.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <span className="text-sm">{script.name}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Cliente *</label>
        <FormField
          control={form.control}
          name="clientId"
          render={() => (
            <FormItem>
              <div className="flex flex-col md:flex-row gap-2">
                <FormControl>
                  {isLoadingClients ? (
                    <div className="h-9 w-full flex items-center justify-center border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <Popover
                        open={isClientOpen}
                        onOpenChange={setIsClientOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex h-9 w-full items-center justify-between text-sm",
                              !selectedClientId && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate text-left flex-1">
                              {selectedClientId
                                ? sortedClients.find(
                                    (client) => client.id === selectedClientId,
                                  )?.fullName
                                : "Selecione um cliente"}
                            </span>
                            <IconChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar por cliente..." />
                            <CommandEmpty>Nenhum resultado.</CommandEmpty>
                            <CommandGroup>
                              {sortedClients.map((client) => (
                                <CommandItem
                                  key={client.id}
                                  value={client.id}
                                  keywords={[client.fullName, client.cpf || ""]}
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    onClientChange(client.id);
                                    setIsClientOpen(false);
                                  }}
                                >
                                  <IconCheck
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedClientId === client.id
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
                    </div>
                  )}
                </FormControl>
                <Dialog
                  open={isClientDialogOpen}
                  onOpenChange={setIsClientDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="">
                      <Plus className="w-4 h-4" />
                      <span>Novo Cliente</span>
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
      </div>
    </div>
  );
}
