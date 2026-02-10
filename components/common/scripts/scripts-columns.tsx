import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { Script } from "@/types/service";

interface ScriptsColumnsProps {
  setEditingItem: (item: Script) => void;
  setOpenDialog: (open: boolean) => void;
  handleDelete: (item: Script) => void;
}

export function scriptsColumns({
  setEditingItem,
  setOpenDialog,
  handleDelete,
}: ScriptsColumnsProps): ColumnDef<Script>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome do Script",
    },
    {
      accessorKey: "serviceTypeName",
      header: "Tipo de Serviço",
    },
    {
      accessorKey: "serviceSubTypeName",
      header: "Subtipo de Serviço",
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => handleDelete(row.original)}
            >
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
