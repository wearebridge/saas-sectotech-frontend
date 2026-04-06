import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceType } from "@/types/service";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

interface ServiceColumnsProps {
  serviceSubTypeId?: string;
  handleDelete: (service: ServiceType) => void;
  setEditingService: (service: ServiceType) => void;
  setOpenDialog: (open: boolean) => void;
  isCompanyAdmin?: boolean;
}

export function serviceColumns({
  handleDelete,
  setEditingService,
  setOpenDialog,
  serviceSubTypeId,
  isCompanyAdmin = false,
}: ServiceColumnsProps): ColumnDef<ServiceType>[] {
  return [
    {
      accessorKey: "name",
      header: "Serviço",
      cell: ({ row }) => (
        <Link
          href={`/subtipos-servicos/tipos/${row.original.serviceSubTypeId ?? serviceSubTypeId}/scripts/${row.original.id}`}
          className="font-medium hover:underline text-primary"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "serviceSubTypeName",

      header: "Sub-tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.serviceSubTypeName || "N/A"}
        </Badge>
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
            {isCompanyAdmin && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setEditingService(row.original);
                  setOpenDialog(true);
                }}
              >
                Editar
              </DropdownMenuItem>
            )}

            <Link
              href={`/subtipos-servicos/tipos/${row.original.serviceSubTypeId ?? serviceSubTypeId}/scripts/${row.original.id}`}
            >
              <DropdownMenuItem className="cursor-pointer">
                Scripts
              </DropdownMenuItem>
            </Link>
            {isCompanyAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => handleDelete(row.original)}
                >
                  Desativar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
