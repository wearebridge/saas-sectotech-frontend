/* eslint-disable @typescript-eslint/no-explicit-any */
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
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useKeycloak } from "@/lib/keycloak";
import { ClientRequest, ClientResponse } from "@/types/client";
import { ClientForm } from "@/components/client-form";
import { ClientService } from "@/service/client/client-service";

import { clientColumns } from "@/components/root/clients/columns";
import { IconInput } from "@/components/ui/icon-input";

interface ClientTableProps {
  onClientCreated?: () => void;
}

export function ClientTable({ onClientCreated }: ClientTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, authenticated } = useKeycloak();

  const [data, setData] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState(searchParams.get("name") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "active");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page") ?? 0),
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientResponse | null>(null);

  const handleGetClients = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await ClientService.findAll(token);
      setData(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Erro ao buscar os clientes.");
    }
  }, [token]);

  const handleDelete = useCallback(
    async (item: ClientResponse) => {
      if (!token) return;

      setLoading(true);
      try {
        await ClientService.delete(item.id, token);
        toast.success("Cliente deletado com sucesso!");
        handleGetClients();
        setLoading(false);
      } catch (error) {
        toast.error("Erro ao deletar cliente.");
        setLoading(false);
      }
    },
    [token, handleGetClients],
  );

  const handleSearch = useCallback(async () => {
    if (!token || !searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await ClientService.search(searchQuery.trim(), token);
      setData(results);
      if (results.length === 0) {
        toast.info("Nenhum cliente encontrado");
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Falha ao buscar clientes");
      setLoading(false);
    }
  }, [token, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    handleGetClients();
  }, [handleGetClients]);

  const columns = useMemo(
    () =>
      clientColumns({
        handleDelete,
        setEditingItem,
        setOpenDialog,
      }),
    [handleDelete],
  );

  useEffect(() => {
    if (authenticated) {
      handleGetClients();
    }
  }, [authenticated, handleGetClients]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (nameFilter) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
          item.surname.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }
    if (status !== "all") {
      const isActive = status === "active";
      filtered = filtered.filter((item) => item.status === isActive);
    }

    return filtered;
  }, [data, nameFilter, status]);

  // Extract unique names for filter
  const uniqueNames = useMemo(
    () => [...new Set(data.map((d) => `${d.name} ${d.surname}`))],
    [data],
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (nameFilter) params.set("name", nameFilter);
    if (status !== "all") params.set("status", status);
    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [nameFilter, status, pageIndex, pageSize, router]);

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
            {/* Search by CPF or Name */}
            <div className="relative flex-1 min-w-75">
              <IconInput
                StartIcon={IconSearch as any}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por CPF ou nome..."
                ButtonIcon={{
                  icon: searchQuery ? (IconX as any) : (IconSearch as any),
                  onClick: clearSearch,
                  visible: !!searchQuery,
                }}
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              variant="secondary"
              className="cursor-pointer"
              size="sm"
            >
              <IconSearch className="h-4 w-4" />
            </Button>

            <Tabs value={status} onValueChange={setStatus} className="ml-2">
              <TabsList>
                <TabsTrigger className="cursor-pointer" value="all">
                  Todos
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="active">
                  Ativos
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="inactive">
                  Inativos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="hidden lg:inline">Colunas</span>
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
              <span className="hidden lg:inline">Novo Cliente</span>
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

      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingItem || undefined}
            onSubmit={async (data: ClientRequest) => {
              if (editingItem) {
                await ClientService.update(editingItem.id, data, token!);
                toast.success("Cliente atualizado com sucesso!");
              } else {
                await ClientService.create(data, token!);
                toast.success("Cliente criado com sucesso!");
              }
              handleGetClients();
              setOpenDialog(false);
              setEditingItem(null);
              onClientCreated?.();
            }}
            onCancel={() => {
              setOpenDialog(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
