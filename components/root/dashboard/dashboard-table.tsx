"use client";

import * as React from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconCalendar,
  IconSearch,
  IconCheck,
  IconChevronDown,
  IconLayoutColumns,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKeycloak } from "@/lib/keycloak";
import { toast } from "sonner";
import { AnalysisItem } from "@/types/analysis";
import { dashboardColumns } from "./dashboard-columns";
import { getAudioDownloadUrl } from "@/service/analysis";

interface DashboardTableProps {
  clientId?: string;
  isClientView?: boolean;
  isHomeView?: boolean;
}

export function DashboardTable({
  clientId,
  isClientView = false,
  isHomeView = false,
}: DashboardTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, authenticated, isCompanyAdmin } = useKeycloak();
  const [data, setData] = React.useState<AnalysisItem[]>([]);
  const [services, setServices] = React.useState<string[]>([]);
  const [subTypes, setSubTypes] = React.useState<string[]>([]);
  const [executors, setExecutors] = React.useState<string[]>([]);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const from = searchParams.get("dateFrom");
      const to = searchParams.get("dateTo");
      if (from || to) {
        return {
          from: from ? new Date(from) : undefined,
          to: to ? new Date(to) : undefined,
        };
      }
      return undefined;
    },
  );
  const [clientSearch, setClientSearch] = React.useState(
    searchParams.get("client") ?? "",
  );
  const [service, setService] = React.useState(
    searchParams.get("service") ?? "",
  );
  const [subType, setSubType] = React.useState(
    searchParams.get("subType") ?? "",
  );
  const [executedBy, setExecutedBy] = React.useState(
    searchParams.get("executedBy") ?? "",
  );
  const [status, setStatus] = React.useState(
    searchParams.get("status") ?? "all",
  );
  const [pageSize, setPageSize] = React.useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = React.useState(
    Number(searchParams.get("page") ?? 0),
  );

  const handleDownloadAudio = React.useCallback(
    async (item: AnalysisItem) => {
      if (!item.audioFilename) {
        toast.error("Nenhum áudio disponível para esta análise");
        return;
      }
      if (!token) {
        toast.error("Você não está autenticado");
        return;
      }

      const result = await getAudioDownloadUrl({ id: item.id, token });
      if (typeof result !== "string") {
        toast.error("Falha ao gerar URL de download do áudio");
        return;
      }

      const ext = item.audioFilename?.split(".").pop() || "mp3";
      const link = document.createElement("a");
      link.href = result;
      link.download = `listen-${item.id}.${ext}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [token],
  );

  const columns: ColumnDef<AnalysisItem>[] = React.useMemo(
    () => dashboardColumns({ handleDownloadAudio, isCompanyAdmin }),
    [handleDownloadAudio, isCompanyAdmin],
  );

  React.useEffect(() => {
    const fetchData = async () => {
      if (!authenticated || !token) return;

      try {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis-results/summary`;
        if (clientId) {
          url += `?clientId=${clientId}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar dados");
        }

        const result = await response.json();
        const mappedData: AnalysisItem[] = result.map((item: any) => ({
          id: item.id,
          date: new Date(item.createdAt),
          clientId: item.clientId,
          clientName: item.clientName || "-",
          clientCpf: item.clientCpf,
          service: item.serviceTypeName || "-",
          subType: item.serviceSubTypeName || "-",
          scriptName: item.scriptName,
          approved: item.approved,
          creditsUsed: item.creditsUsed,
          executedBy: item.executedBy,
          audioFilename: item.audioFilename,
          audioUrl: item.audioUrl,
        }));

        // Ordenar por data (mais recente primeiro)
        mappedData.sort((a, b) => b.date.getTime() - a.date.getTime());

        setData(mappedData);

        const uniqueServices = Array.from(
          new Set(mappedData.map((d) => d.service).filter((s) => s !== "-")),
        ) as string[];
        const uniqueSubTypes = Array.from(
          new Set(mappedData.map((d) => d.subType).filter((s) => s !== "-")),
        ) as string[];
        const uniqueExecutors = Array.from(
          new Set(mappedData.map((d) => d.executedBy).filter(Boolean)),
        ) as string[];
        setServices(uniqueServices);
        setSubTypes(uniqueSubTypes);
        setExecutors(uniqueExecutors);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar histórico de análises");
      }
    };

    fetchData();
  }, [token, authenticated, clientId]);

  const filteredData = React.useMemo(() => {
    let filtered = data.filter((item) => {
      if (dateRange?.from && item.date < startOfDay(dateRange.from))
        return false;
      if (dateRange?.to && item.date > endOfDay(dateRange.to)) return false;
      if (clientSearch) {
        const search = clientSearch.trim().toLowerCase();
        const fullName = (item.clientName || "").toLowerCase();
        const cpf = item.clientCpf?.replace(/\D/g, "") || "";
        const searchDigits = search.replace(/\D/g, "");
        if (
          !fullName.includes(search) &&
          !(searchDigits && cpf.includes(searchDigits))
        )
          return false;
      }
      if (service && item.service !== service) return false;
      if (subType && item.subType !== subType) return false;
      if (executedBy && item.executedBy !== executedBy) return false;

      if (status === "approved") return item.approved;
      if (status === "rejected") return !item.approved;

      return true;
    });

    // Se for a view home, retornar apenas os últimos 5
    if (isHomeView) {
      return filtered.slice(0, 5);
    }

    return filtered;
  }, [
    data,
    dateRange,
    clientSearch,
    service,
    subType,
    executedBy,
    status,
    isHomeView,
  ]);

  React.useEffect(() => {
    if (clientId) return; // Don't update URL params when filtering by clientId
    const params = new URLSearchParams();
    if (dateRange?.from) params.set("dateFrom", dateRange.from.toISOString());
    if (dateRange?.to) params.set("dateTo", dateRange.to.toISOString());
    if (clientSearch) params.set("client", clientSearch);
    if (service) params.set("service", service);
    if (subType) params.set("subType", subType);
    if (executedBy) params.set("executedBy", executedBy);
    if (status !== "all") params.set("status", status);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [
    dateRange,
    clientSearch,
    service,
    subType,
    executedBy,
    status,
    pageIndex,
    pageSize,
    clientId,
    router,
  ]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        {!isHomeView && (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 w-full justify-start gap-2 text-left text-sm font-normal sm:w-auto",
                      !dateRange?.from && "text-muted-foreground",
                    )}
                  >
                    <IconCalendar className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy", { locale: ptBR })}
                          {" - "}
                          {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      "Período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    locale={ptBR}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => setDateRange(undefined)}
                >
                  Limpar data
                </Button>
              )}

              {isClientView === false && (
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar por nome ou CPF"
                    className="h-9 w-full pl-8 text-sm leading-none sm:w-55"
                  />
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex h-9 w-full items-center justify-between text-sm sm:w-50",
                      !service && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{service || "Serviço"}</span>
                    <IconChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 sm:w-50">
                  <Command>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup>
                      {services.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() =>
                            setService((prev) => (prev === item ? "" : item))
                          }
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 h-4 w-4",
                              service === item ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="text-sm">{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex h-9 w-full items-center justify-between text-sm sm:w-50",
                      !subType && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{subType || "Subtipo"}</span>
                    <IconChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 sm:w-50">
                  <Command>
                    <CommandInput placeholder="Buscar Subtipo..." />
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup>
                      {subTypes.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() =>
                            setSubType((prev) => (prev === item ? "" : item))
                          }
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 h-4 w-4",
                              subType === item ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="text-sm">{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex h-9 w-full items-center justify-between text-sm sm:w-50",
                      !executedBy && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{executedBy || "Executor"}</span>
                    <IconChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 sm:w-50">
                  <Command>
                    <CommandInput placeholder="Buscar executor..." />
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup>
                      {executors.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() =>
                            setExecutedBy((prev) => (prev === item ? "" : item))
                          }
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 h-4 w-4",
                              executedBy === item ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="text-sm">{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <Tabs
                value={status}
                onValueChange={setStatus}
                className="w-full sm:ml-2 sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="approved">Aprovados</TabsTrigger>
                  <TabsTrigger value="rejected">Reprovados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex w-full items-center gap-2 xl:w-auto xl:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <IconLayoutColumns className="h-4 w-4" />
                    <span className="hidden lg:inline">Colunas</span>
                    <span className="lg:hidden">Colunas</span>
                    <IconChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        column.getCanHide() && column.id !== "actions",
                    )
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {String(column.columnDef.header)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-max">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 font-medium">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
          {!isHomeView && (
            <>
              <div className="flex items-center justify-between gap-2 text-sm font-medium sm:justify-start">
                <span>Linhas por página</span>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="h-8 w-17.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <span className="text-sm font-medium">
                  Página {pageIndex + 1} de {table.getPageCount()}
                </span>

                <div className="flex items-center gap-1 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPageIndex(0)}
                  >
                    <IconChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPageIndex((p) =>
                        Math.min(p + 1, table.getPageCount() - 1),
                      )
                    }
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPageIndex(table.getPageCount() - 1)}
                  >
                    <IconChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
