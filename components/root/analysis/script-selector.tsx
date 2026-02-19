"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useKeycloak } from "@/lib/keycloak";
import { Script, ServiceType, ServiceSubType } from "@/types/analysis";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";
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

interface ScriptSelectorProps {
  onScriptSelect: (script: Script | null) => void;
  selectedScript: Script | null;
  selectedServiceSubTypeId: string;
  selectedServiceTypeId: string;
  onServiceSubTypeChange: (serviceSubTypeId: string) => void;
  onServiceTypeChange: (serviceTypeId: string) => void;
}

export function ScriptSelector({
  onScriptSelect,
  selectedScript,
  selectedServiceSubTypeId,
  selectedServiceTypeId,
  onServiceSubTypeChange,
  onServiceTypeChange,
}: ScriptSelectorProps) {
  const [isSubTypeOpen, setIsSubTypeOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceSubTypes, setServiceSubTypes] = useState<ServiceSubType[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingScripts, setIsLoadingScripts] = useState(false);
  const { token, authenticated } = useKeycloak();

  const fetchingRef = useRef(false);

  const handleGetServiceSubType = useCallback(async () => {
    if (!token) return;

    setIsLoadingSubTypes(true);
    try {
      const result = await getSubTypeService({ token: token });

      if (result instanceof Error) {
        toast.error(result.message || "Erro ao carregar subtipos de serviço");
        return;
      }

      setServiceSubTypes(result);
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

        if (result instanceof Error) {
          toast.error(result.message || "Erro ao carregar tipos de serviço");
          return;
        }

        setServiceTypes(result);
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

        if (result instanceof Error) {
          toast.error(result.message || "Erro ao carregar scripts");
          setIsLoadingScripts(false);
          fetchingRef.current = false;
          return;
        }

        setScripts(result);
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
                <span className="truncate">
                  {selectedServiceSubTypeId
                    ? serviceSubTypes.find(
                        (subType) => subType.id === selectedServiceSubTypeId,
                      )?.name
                    : "Selecione um subtipo de serviço"}
                </span>
                <IconChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar por subtipo..." />
                <CommandEmpty>Nenhum resultado.</CommandEmpty>
                <CommandGroup>
                  {serviceSubTypes.map((subType) => (
                    <CommandItem
                      key={subType.id}
                      value={subType.name}
                      className="cursor-pointer"
                      onSelect={() => {
                        handleServiceSubTypeChange(
                          selectedServiceSubTypeId === subType.id
                            ? ""
                            : subType.id,
                        );
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
      </div>

      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Tipo de Serviço</label>
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
                <span className="truncate">
                  {selectedServiceTypeId
                    ? serviceTypes.find(
                        (type) => type.id === selectedServiceTypeId,
                      )?.name
                    : selectedServiceSubTypeId
                      ? "Selecione um tipo de serviço"
                      : "Selecione um subtipo primeiro"}
                </span>
                <IconChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar por tipo..." />
                <CommandEmpty>Nenhum resultado.</CommandEmpty>
                <CommandGroup>
                  {serviceTypes.map((type) => (
                    <CommandItem
                      key={type.id}
                      value={type.name}
                      className="cursor-pointer"
                      onSelect={() => {
                        handleServiceTypeChange(
                          selectedServiceTypeId === type.id ? "" : type.id,
                        );
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
      </div>

      <div className="flex-1 flex gap-2 flex-col">
        <label className="text-sm font-medium">Script</label>
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
                <span className="truncate">
                  {selectedScript?.name
                    ? selectedScript.name
                    : selectedServiceTypeId
                      ? "Selecione um script"
                      : "Selecione um tipo primeiro"}
                </span>
                <IconChevronDown className="h-4 w-4 opacity-50" />
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
                        value={script.name}
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
      </div>
    </div>
  );
}
