import { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { User } from "@/types/users";

// export function columnsUsers(): ColumnDef<User>[] {

export const columnsUsers: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "Nome",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "enabled",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          row.original.enabled
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800",
        )}
      >
        {row.original.enabled ? "Ativo" : "Inativo"}
      </span>
    ),
  },
  {
    accessorKey: "createdTimestamp",
    header: "Criado em",
    cell: ({ row }) => {
      const date = new Date(row.original.createdTimestamp);
      return date.toLocaleDateString("pt-BR");
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Desabilitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
