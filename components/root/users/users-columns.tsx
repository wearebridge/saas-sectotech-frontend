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

interface UsersColumnsProps {
  setSeletedUser: (user: User | null) => void;
  setOpenDialog: (open: boolean) => void;
  onDisableUser: (user: User) => void;
  onResetPassword: (user: User) => void;
  currentUserId?: string;
  isCompanyAdmin: boolean;
}

export function columnsUsers({
  setSeletedUser,
  setOpenDialog,
  onDisableUser,
  onResetPassword,
  currentUserId,
  isCompanyAdmin,
}: UsersColumnsProps): ColumnDef<User>[] {
  return [
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
      cell: ({ row }) => {
        const isSelf = row.original.id === currentUserId;
        const canEdit = isSelf || isCompanyAdmin;
        const canManage = isCompanyAdmin && !isSelf;

        if (!canEdit) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSeletedUser(row.original);
                  setOpenDialog(true);
                }}
              >
                Editar
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem
                    onClick={() => onResetPassword(row.original)}
                  >
                    Resetar Senha
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {row.original.enabled && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDisableUser(row.original)}
                    >
                      Desabilitar
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
