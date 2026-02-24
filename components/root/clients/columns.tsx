import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientResponse } from "@/types/client";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

// Helper function to format CPF
const formatCPF = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

interface ClientColumnsProps {
  setEditingItem: (item: ClientResponse) => void;
  setOpenDialog: (open: boolean) => void;
  handleDelete: (item: ClientResponse) => void;
}

export const clientColumns = ({
  handleDelete,
  setEditingItem,
  setOpenDialog,
}: ClientColumnsProps) => {
  const columns: ColumnDef<ClientResponse>[] = [
    {
      accessorKey: "fullName",
      header: "Nome",
      cell: ({ row }) => (
        <Link
          href={`/clientes/analises/${row.original.id}`}
          className="font-medium hover:underline text-primary"
        >
          {row.original.fullName}
        </Link>
      ),
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => {
        const cpf = row.original.cpf;
        return cpf ? (
          <span className="font-mono text-sm">{formatCPF(cpf)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "rg",
      header: "RG",
      cell: ({ row }) => {
        const rg = row.original.rg;
        return rg ? (
          <span className="text-sm">{rg}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "birthDate",
      header: "Data de Nascimento",
      cell: ({ row }) => {
        const birthDate = row.original.birthDate;
        return birthDate ? (
          <span className="text-sm">{formatDate(birthDate)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Endereço",
      cell: ({ row }) => (
        <span
          className="text-muted-foreground truncate max-w-50 block text-sm"
          title={row.original.address}
        >
          {row.original.address || "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-1.5 text-muted-foreground"
        >
          {row.original.status ? (
            <IconCircleCheckFilled className="h-4 w-4 fill-emerald-500 dark:fill-emerald-400" />
          ) : (
            <IconCircleXFilled className="h-4 w-4 fill-destructive" />
          )}
          {row.original.status ? "Ativo" : "Inativo"}
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setEditingItem(row.original);
                setOpenDialog(true);
              }}
            >
              Editar
            </DropdownMenuItem>

            <Link href={`/clientes/analises/${row.original.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                Ver Análises
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => handleDelete(row.original)}
            >
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
};
