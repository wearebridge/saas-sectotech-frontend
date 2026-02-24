"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { useKeycloak } from "@/lib/keycloak";
import { getErrorMessage } from "@/lib/errors/error-utils";
import { ServiceSubType } from "@/types/service";
import { ServiceSubTypeForm } from "./service-sub-type-form";

import { serviceColumns } from "./columns";
import {
  deleteServiceSubType,
  getSubTypeService,
} from "@/service/services-sub-type";

export function ServiceSubTypeTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, authenticated } = useKeycloak();

  const [data, setData] = useState<ServiceSubType[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "active");
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page") ?? 0),
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceSubType | null>(null);

  const handleGetSubTypes = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await getSubTypeService({ token });

      const errorMessage = getErrorMessage(data);
      if (errorMessage) {
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      setData(data as ServiceSubType[]);
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error("Erro ao buscar os subtipos de serviço.");
    }
  }, [token]);

  const handleDelete = useCallback(
    async (item: ServiceSubType) => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await deleteServiceSubType({ item, token });

        const errorMessage = getErrorMessage(response);
        if (errorMessage) {
          toast.error(errorMessage);
          setLoading(false);
          return;
        }

        toast.success(response as string);

        handleGetSubTypes();
        setLoading(false);
      } catch {
        toast.error("Erro ao deletar subtipo de serviço.");
        setLoading(false);
      }
    },
    [token, handleGetSubTypes],
  );

  const columns = useMemo(
    () =>
      serviceColumns({
        handleDelete,
        setEditingItem,
        setOpenDialog,
      }),
    [handleDelete, setEditingItem, setOpenDialog],
  );

  useEffect(() => {
    if (authenticated) {
      handleGetSubTypes();
    }
  }, [authenticated, handleGetSubTypes]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (name) {
      filtered = filtered.filter((item) => item.name === name);
    }
    if (status !== "all") {
      const isActive = status === "active";
      filtered = filtered.filter((item) => item.status === isActive);
    }

    return filtered;
  }, [data, name, status]);

  // Extract unique values for filters
  const uniqueNames = useMemo(
    () => [...new Set(data.map((d) => d.name))],
    [data],
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (name) params.set("name", name);
    if (status !== "all") params.set("status", status);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [name, status, pageIndex, pageSize, router]);

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex w-[200px] items-center justify-between text-sm",
                    !name && "text-muted-foreground",
                  )}
                >
                  <span className="truncate">{name || "Nome"}</span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar por nome..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {uniqueNames.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() =>
                          setName((prev) => (prev === item ? "" : item))
                        }
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            name === item ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="text-sm">{item}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

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
              onClick={() => {
                setEditingItem(null);
                setOpenDialog(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Novo Subtipo</span>
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
              ) : table.getRowModel().rows.length > 0 ? (
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
              Página {pageIndex + 1} de {table.getPageCount() || 1}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={!table.getCanPreviousPage()}
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
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ServiceSubTypeForm
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingItem(null);
        }}
        onSuccess={handleGetSubTypes}
        subTypeId={editingItem?.id}
        initialData={
          editingItem
            ? {
                name: editingItem.name,
                description: editingItem.description || "",
                status: editingItem.status ? "active" : "inactive",
              }
            : undefined
        }
      />
    </>
  );
}
