"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useKeycloak } from "@/lib/keycloak";
import { useCredit } from "@/lib/credit-context";
import { CreditTransaction } from "@/types/credit-transaction";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpCircle } from "lucide-react";
import { PurchaseLoading } from "./purchase-loading";
import { columnsPurchaseHistory } from "./columns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconX,
} from "@tabler/icons-react";

export function PurchaseHistory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, keycloak } = useKeycloak();
  const { credits } = useCredit();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize") ?? 10),
  );
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page") ?? 0),
  );

  const columns: ColumnDef<CreditTransaction>[] = columnsPurchaseHistory;

  const getTransactionType = (amount: number): string => {
    return amount > 0 ? "Compra" : "Uso";
  };

  const fetchTransactions = useCallback(async () => {
    if (!token || !keycloak?.tokenParsed) return;

    const companyId = (keycloak.tokenParsed as any).companyId;
    if (!companyId) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      // First get the company credit ID
      const creditRes = await fetch(
        `${apiUrl}/companyCredits/byCompanyId/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!creditRes.ok) {
        setTransactions([]);
        return;
      }

      const creditData = await creditRes.json();

      // Then fetch transactions
      const txRes = await fetch(
        `${apiUrl}/creditTransactions/byCompanyCredit/${creditData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (txRes.ok) {
        const txData: CreditTransaction[] = await txRes.json();
        // Sort by date descending
        txData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTransactions(txData);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [token, keycloak]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, credits]); // Re-fetch when credits change (after purchase)

  useEffect(() => {
    const params = new URLSearchParams();

    if (type) params.set("type", type);

    params.set("page", String(pageIndex));
    params.set("pageSize", String(pageSize));
    router.replace(`?${params.toString()}`);
  }, [type, pageIndex, pageSize, router]);

  const filteredData = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type if selected
    if (type) {
      filtered = filtered.filter(
        (transaction) => getTransactionType(transaction.amount) === type,
      );
    }

    return filtered;
  }, [transactions, type]);

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

  if (loading) {
    return <PurchaseLoading />;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ArrowUpCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Nenhuma transação encontrada</p>
        <p className="text-sm">
          As transações de compra de créditos aparecerão aqui.
        </p>
      </div>
    );
  }

  // Get unique transaction types
  const transactionTypes = Array.from(
    new Set(transactions.map((t) => getTransactionType(t.amount))),
  );

  return (
    <div className="space-y-4">
      <Tabs value={type} onValueChange={setType}>
        <TabsList>
          <TabsTrigger value="" className="cursor-pointer">
            Todos
          </TabsTrigger>
          {transactionTypes.map((transactionType) => (
            <TabsTrigger
              key={transactionType}
              value={transactionType}
              className="cursor-pointer"
            >
              {transactionType}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
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
  );
}
