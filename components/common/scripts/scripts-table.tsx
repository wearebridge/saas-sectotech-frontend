"use client";

import * as React from "react";
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
import { Script } from "@/types/service";
import { ScriptForm } from "./script-form";
import { scriptsColumns } from "./scripts-columns";
import { deleteScript, getScripts } from "@/service/scripts";

type ScriptsTableProps = {
  serviceTypeId?: string;
  isPage?: boolean;
};

export function ScriptsTable({
  serviceTypeId,
  isPage = false,
}: ScriptsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, authenticated, isCompanyAdmin } = useKeycloak();

  const [data, setData] = React.useState<Script[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState(searchParams.get("name") ?? "");
  const [selectedType, setSelectedType] = React.useState(
    searchParams.get("type") ?? "",
  );
  const [selectedSubType, setSelectedSubType] = React.useState(
    searchParams.get("subType") ?? "",
  );
  const [status, setStatus] = React.useState(
    searchParams.get("status") ?? "active",
  );
  const [pageSize, setPageSize] = React.useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = React.useState(
    Number(searchParams.get("page") ?? 0),
  );
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Script | null>(null);

  const handleGetScripts = React.useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const result = await getScripts({ token, serviceTypeId });

      const errorMessage = getErrorMessage(result);
      if (errorMessage) {
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      setData(result as Script[]);
    } catch (error) {
      toast.error("Erro ao consultar os scripts");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [token, serviceTypeId]);

  const handleDelete = React.useCallback(
    async (item: Script) => {
      if (!token) return;

      setLoading(true);

      try {
        const response = await deleteScript({ id: item.id, token, item });

        const errorMessage = getErrorMessage(response);
        if (errorMessage) {
          toast.error(errorMessage);
          setLoading(false);
          return;
        }

        toast.success(response as string);
        handleGetScripts();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao desativar script");
        setLoading(false);
      }
    },
    [token, handleGetScripts],
  );

  const columns: ColumnDef<Script>[] = React.useMemo(
    () => scriptsColumns({ handleDelete, setEditingItem, setOpenDialog, isCompanyAdmin }),
    [handleDelete, isCompanyAdmin],
  );

  React.useEffect(() => {
    if (authenticated) {
      handleGetScripts();
    }
  }, [authenticated, handleGetScripts]);

  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    if (name) {
      filtered = filtered.filter((item) => item.name === name);
    }
    if (selectedType) {
      filtered = filtered.filter(
        (item) => item.serviceTypeName === selectedType,
      );
    }
    if (selectedSubType) {
      filtered = filtered.filter(
        (item) => item.serviceSubTypeName === selectedSubType,
      );
    }
    if (status !== "all") {
      const isActive = status === "active";
      filtered = filtered.filter((item) => item.status === isActive);
    }

    return filtered;
  }, [data, name, selectedType, selectedSubType, status]);

  const uniqueNames = React.useMemo(
    () => [...new Set(data.map((d) => d.name))],
    [data],
  );
  const uniqueTypes = React.useMemo(
    () =>
      [
        ...new Set(
          data.filter((d) => d.serviceTypeName).map((d) => d.serviceTypeName!),
        ),
      ].sort(),
    [data],
  );
  const uniqueSubTypes = React.useMemo(
    () =>
      [
        ...new Set(
          data
            .filter((d) => d.serviceSubTypeName)
            .map((d) => d.serviceSubTypeName!),
        ),
      ].sort(),
    [data],
  );

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (selectedType) params.set("type", selectedType);
    if (selectedSubType) params.set("subType", selectedSubType);
    if (status !== "all") params.set("status", status);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [
    name,
    selectedType,
    selectedSubType,
    status,
    pageIndex,
    pageSize,
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
                  <span className="truncate">{name || "Nome do Script"}</span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar script..." />
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex w-[200px] items-center justify-between text-sm",
                    !selectedType && "text-muted-foreground",
                  )}
                >
                  <span className="truncate">
                    {selectedType || "Tipo de Serviço"}
                  </span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar tipo..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {uniqueTypes.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() =>
                          setSelectedType((prev) => (prev === item ? "" : item))
                        }
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedType === item ? "opacity-100" : "opacity-0",
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
                    "flex w-[200px] items-center justify-between text-sm",
                    !selectedSubType && "text-muted-foreground",
                  )}
                >
                  <span className="truncate">
                    {selectedSubType || "Subtipo de Serviço"}
                  </span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar subtipo..." />
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {uniqueSubTypes.map((item) => (
                      <CommandItem
                        key={item}
                        value={item}
                        onSelect={() =>
                          setSelectedSubType((prev) =>
                            prev === item ? "" : item,
                          )
                        }
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSubType === item
                              ? "opacity-100"
                              : "opacity-0",
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

          {!isPage && isCompanyAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="sectotech"
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setOpenDialog(true);
                }}
              >
                <IconPlus className="h-4 w-4" />
                <span className="hidden lg:inline">Novo Script</span>
              </Button>
            </div>
          )}
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
                    Nenhum script encontrado.
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

      <ScriptForm
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingItem(null);
        }}
        onSuccess={handleGetScripts}
        serviceTypeId={serviceTypeId}
        scriptId={editingItem?.id}
        initialData={
          editingItem
            ? {
                name: editingItem.name,
                status: editingItem.status,
                scriptItems: editingItem.scriptItems
                  ? editingItem.scriptItems
                  : [],
              }
            : undefined
        }
      />
    </>
  );
}
