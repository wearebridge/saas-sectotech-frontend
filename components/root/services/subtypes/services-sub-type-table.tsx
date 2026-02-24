"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconCheck,
  IconChevronDown,
  IconLayoutColumns,
  IconPlus,
  IconChevronsLeft,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
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
import { toast } from "sonner";
import { ServiceForm } from "./service-form";
import { useKeycloak } from "@/lib/keycloak";
import { getErrorMessage } from "@/lib/errors/error-utils";
import { ServiceType } from "@/types/service";
import { serviceColumns } from "./services-sub-type-columns";
import { deleteService, getServices } from "@/service/services-type";
import { useCallback, useEffect, useMemo, useState } from "react";

type ServicesTableProps = {
  serviceSubTypeId?: string;
};

export function ServicesTable({ serviceSubTypeId }: ServicesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, authenticated } = useKeycloak();

  const [data, setData] = useState<ServiceType[]>([]);

  const [loading, setLoading] = useState(true);

  const [service, setService] = useState(searchParams.get("service") ?? "");
  const [subType, setSubType] = useState(searchParams.get("subType") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "active");
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page") ?? 0),
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(
    null,
  );

  const handleGetServices = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      if (!serviceSubTypeId) {
        toast.error("ID do sub-tipo de serviço não fornecido");
        setLoading(false);
        return;
      }

      const result = await getServices({ token, serviceSubTypeId });

      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      setLoading(false);
      setData(result as ServiceType[]);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Erro ao buscar os serviços");
    }
  }, [token, serviceSubTypeId]);

  const handleDelete = useCallback(
    async (item: ServiceType) => {
      if (!token) return;

      setLoading(true);
      try {
        const result = await deleteService({ token, item });

        const errorMessage = getErrorMessage(result);
        if (errorMessage) {
          toast.error(errorMessage);
          setLoading(false);
          return;
        }

        toast.success("Serviço desativado com sucesso");
        setLoading(false);
        handleGetServices();
      } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Erro ao desativar serviço");
      }
    },
    [token, handleGetServices],
  );

  const columns: ColumnDef<ServiceType>[] = useMemo(
    () =>
      serviceColumns({
        handleDelete,
        setEditingService,
        setOpenDialog,
        serviceSubTypeId,
      }),
    [serviceSubTypeId, handleDelete],
  );

  useEffect(() => {
    if (authenticated) {
      handleGetServices();
    }
  }, [authenticated, handleGetServices]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (service) {
      filtered = filtered.filter((item) => item.name === service);
    }
    if (subType) {
      filtered = filtered.filter((item) => item.serviceSubTypeName === subType);
    }
    if (status !== "all") {
      const isActive = status === "active";
      filtered = filtered.filter((item) => item.status === isActive);
    }

    return filtered;
  }, [data, service, subType, status]);

  // Extract unique values for filters
  const uniqueServices = useMemo(
    () => [...new Set(data.map((d) => d.name))],
    [data],
  );
  const uniqueSubTypes = useMemo(
    () => [...new Set(data.map((d) => d.serviceSubTypeName).filter(Boolean))],
    [data],
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (service) params.set("service", service);
    if (subType) params.set("subType", subType);
    if (status !== "all") params.set("status", status);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [service, subType, status, pageIndex, pageSize, router]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      columnVisibility: {
        serviceSubTypeName: !serviceSubTypeId,
      },
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex w-[200px] items-center justify-between text-sm",
                    !service && "text-muted-foreground",
                  )}
                >
                  <span className="truncate">{service || "Serviço"}</span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar serviço..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {uniqueServices.map((item) => (
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

            {!serviceSubTypeId && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex w-[200px] items-center justify-between text-sm",
                      !subType && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{subType || "Sub-tipo"}</span>
                    <IconChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar sub-tipo..." />
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup>
                      {uniqueSubTypes.map((item) => (
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
            )}

            <Tabs value={status} onValueChange={setStatus} className="ml-2">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
                    (column) => column.getCanHide() && column.id !== "actions",
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

            <Button
              variant="sectotech"
              size="sm"
              onClick={() => setOpenDialog(true)}
            >
              <IconPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Novo serviço</span>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
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
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-8 px-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Linhas por página</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
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

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">
              Página {pageIndex + 1} de {table.getPageCount()}
            </span>

            <div className="flex items-center gap-1">
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
                  setPageIndex((p) => Math.min(p + 1, table.getPageCount() - 1))
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
        </div>
      </div>

      <ServiceForm
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingService(null);
        }}
        onSuccess={handleGetServices}
        defaultSubTypeId={serviceSubTypeId}
        serviceId={editingService?.id}
        initialData={
          editingService
            ? {
                name: editingService.name,
                description: editingService.description || "",
                subtypeId: editingService.serviceSubTypeId,
                status: editingService.status ? "active" : "inactive",
              }
            : undefined
        }
      />
    </>
  );
}
