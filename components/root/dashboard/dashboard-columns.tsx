import { AnalysisItem } from "@/types/analysis";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconDownload,
  IconEye,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardColumnsProps {
  handleDownloadAudio: (analysis: AnalysisItem) => void;
  isCompanyAdmin?: boolean;
}

export const dashboardColumns = ({
  handleDownloadAudio,
  isCompanyAdmin = false,
}: DashboardColumnsProps) => {
  const columns: ColumnDef<AnalysisItem>[] = [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => (
        <Link href={`/historico/detalhes/${row.original.id}`}>
          <span className="cursor-pointer hover:underline">
            {format(row.original.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </span>
        </Link>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Cliente",
      cell: ({ row }) => (
        <Link href={`/historico/detalhes/${row.original.id}`}>
          <span className="font-medium cursor-pointer hover:underline">
            {row.original.clientName}
          </span>
        </Link>
      ),
    },
    {
      accessorKey: "service",
      header: "Serviço",
    },
    {
      accessorKey: "subType",
      header: "Subtipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.subType}
        </Badge>
      ),
    },
    {
      accessorKey: "creditsUsed",
      header: "Créditos",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.creditsUsed != null
            ? row.original.creditsUsed.toFixed(1)
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "executedBy",
      header: "Executado por",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.executedBy || "-"}</span>
      ),
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-1.5 text-muted-foreground"
        >
          {row.original.approved ? (
            <IconCircleCheckFilled className="h-4 w-4 fill-emerald-500 dark:fill-emerald-400" />
          ) : (
            <IconCircleXFilled className="h-4 w-4 fill-destructive" />
          )}
          {row.original.approved ? "Aprovado" : "Reprovado"}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDotsVertical className="h-4 w-4 fill-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/historico/detalhes/${row.original.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <IconEye className="mr-2 h-4 w-4" />
                Ver análise
              </DropdownMenuItem>
            </Link>
            {isCompanyAdmin && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleDownloadAudio(row.original)}
                disabled={!row.original.audioUrl}
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Baixar áudio
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
};
