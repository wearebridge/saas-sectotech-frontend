"use client";

import { useEffect, useState, useCallback } from "react";
import { useKeycloak } from "@/lib/keycloak";
import { CreditTransaction } from "@/types/credit-transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { CalendarClock, Package, AlertTriangle } from "lucide-react";
import { PurchaseLoading } from "./purchase-loading";

export function CreditLots() {
  const { token, keycloak } = useKeycloak();
  const [lots, setLots] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLots = useCallback(async () => {
    if (!token || !keycloak?.tokenParsed) return;
    const companyId = (keycloak.tokenParsed as Record<string, string>)
      .companyId;
    if (!companyId) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const creditRes = await fetch(
        `${apiUrl}/companyCredits/byCompanyId/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!creditRes.ok) {
        setLots([]);
        return;
      }
      const creditData = await creditRes.json();

      const lotsRes = await fetch(
        `${apiUrl}/creditTransactions/lots/byCompanyCredit/${creditData.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (lotsRes.ok) {
        const lotsData: CreditTransaction[] = await lotsRes.json();
        setLots(lotsData);
      }
    } catch (error) {
      console.error("Error fetching credit lots:", error);
    } finally {
      setLoading(false);
    }
  }, [token, keycloak]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  if (loading) return <PurchaseLoading />;

  if (lots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Package className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Nenhum lote de créditos</p>
        <p className="text-sm">
          Compre créditos para ver a validade deles aqui.
        </p>
      </div>
    );
  }

  const now = new Date();

  const getStatus = (lot: CreditTransaction) => {
    const remaining = Number(lot.remainingAmount ?? 0);
    const expiresAt = lot.expiresAt ? new Date(lot.expiresAt) : null;

    if (remaining <= 0) return "depleted";
    if (expiresAt && expiresAt <= now) return "expired";

    if (expiresAt) {
      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilExpiry <= 7) return "expiring-soon";
    }

    return "active";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Ativo
          </Badge>
        );
      case "expiring-soon":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expirando
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Expirado
          </Badge>
        );
      case "depleted":
        return <Badge variant="secondary">Esgotado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSourceBadge = (sourceType?: string) => {
    switch (sourceType) {
      case "RECURRING":
        return <Badge variant="outline">Plano</Badge>;
      case "ONE_TIME":
        return <Badge variant="outline">Avulso</Badge>;
      case "MANUAL":
        return <Badge variant="outline">Manual</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatExpiryDate = (expiresAt?: string) => {
    if (!expiresAt) return "—";
    return formatDate(expiresAt);
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    if (expiry <= now) return 0;
    return Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-4 font-medium">
                Data de Compra
              </TableHead>
              <TableHead className="px-4 font-medium">Tipo</TableHead>
              <TableHead className="px-4 font-medium">
                Créditos Originais
              </TableHead>
              <TableHead className="px-4 font-medium">Restantes</TableHead>
              <TableHead className="px-4 font-medium">Expiração</TableHead>
              <TableHead className="px-4 font-medium">
                Dias Restantes
              </TableHead>
              <TableHead className="px-4 font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot) => {
              const status = getStatus(lot);
              const original = Number(lot.amount);
              const remaining = Number(lot.remainingAmount ?? 0);
              const progress =
                original > 0 ? (remaining / original) * 100 : 0;
              const daysRemaining = getDaysRemaining(lot.expiresAt);

              return (
                <TableRow
                  key={lot.id}
                  className={
                    status === "expired" || status === "depleted"
                      ? "opacity-50"
                      : status === "expiring-soon"
                        ? "bg-amber-50/50 dark:bg-amber-950/10"
                        : ""
                  }
                >
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(lot.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {getSourceBadge(lot.sourceType)}
                  </TableCell>
                  <TableCell className="px-4 font-semibold">
                    {original.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="space-y-1">
                      <span className="font-semibold">
                        {remaining.toFixed(2)}
                      </span>
                      <Progress value={progress} className="h-1.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {formatExpiryDate(lot.expiresAt)}
                  </TableCell>
                  <TableCell className="px-4">
                    {daysRemaining !== null ? (
                      <span
                        className={
                          daysRemaining <= 7 && daysRemaining > 0
                            ? "text-amber-600 font-semibold"
                            : daysRemaining <= 0
                              ? "text-red-500"
                              : ""
                        }
                      >
                        {daysRemaining > 0 ? `${daysRemaining} dias` : "Expirado"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    {getStatusBadge(status)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
