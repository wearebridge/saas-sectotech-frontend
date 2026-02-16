import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CreditTransaction } from "@/types/credit-transaction";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowUpCircle, User } from "lucide-react";

export const columnsPurchaseHistory: ColumnDef<CreditTransaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Data da Compra",
    cell: ({ row }) => {
      return formatDate(row.original.createdAt);
    },
  },
  {
    accessorKey: "amount",
    header: "Créditos",
    cell: ({ row }) => {
      const isCredit = row.original.amount > 0;

      return (
        <div className="flex items-center gap-2">
          {isCredit ? (
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              isCredit
                ? "text-green-600 font-semibold"
                : "text-red-500 font-semibold"
            }
          >
            {isCredit ? "+" : ""}
            {Number(row.original.amount).toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "",
    header: "Tipo",
    cell: ({ row }) => {
      const isCredit = row.original.amount > 0;

      return (
        <Badge variant={isCredit ? "default" : "secondary"}>
          {isCredit ? "Compra" : "Uso"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "purchasedByName",
    header: "Comprado Por",
    cell: ({ row }) => {
      const { purchasedByName } = row.original;
      return (
        <>
          {purchasedByName ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{purchasedByName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </>
      );
    },
  },
];
