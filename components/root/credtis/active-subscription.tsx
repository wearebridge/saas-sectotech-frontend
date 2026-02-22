"use client";

import { useEffect, useState, useCallback } from "react";
import { useKeycloak } from "@/lib/keycloak";
import { SubscriptionInfo } from "@/types/package";
import { formatCurrency, formatInterval } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CalendarDays, XCircle, Coins } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ActiveSubscriptionProps {
  subscription: SubscriptionInfo | null;
  loading: boolean;
  onCancelled: () => void;
}

export function ActiveSubscription({
  subscription,
  loading,
  onCancelled,
}: ActiveSubscriptionProps) {
  const { token } = useKeycloak();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiUrl}/payment/cancel-subscription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        toast.success("Assinatura cancelada com sucesso!");
        onCancelled();
      } else {
        toast.error("Erro ao cancelar a assinatura.");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Erro ao cancelar a assinatura.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  const nextRenewal = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      )
    : null;

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription className="text-primary/80 font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Plano Ativo
            </CardDescription>
            <CardTitle className="text-2xl font-bold mt-1 flex items-center gap-3">
              {subscription.planName}
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                {subscription.status === "active" ? "Ativo" : subscription.status}
              </Badge>
            </CardTitle>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <XCircle className="h-4 w-4" />
                Cancelar Assinatura
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar sua assinatura do plano{" "}
                  <strong>{subscription.planName}</strong>? Seus créditos
                  restantes continuarão válidos até a data de expiração
                  original. Você não receberá novos créditos após o
                  cancelamento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelando..." : "Confirmar Cancelamento"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-primary/70">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4" />
            <span>
              <strong>{subscription.credits}</strong> créditos
              {formatInterval(subscription.interval ?? undefined)}
            </span>
          </div>
          {subscription.unitAmount && (
            <div className="flex items-center gap-1.5">
              <span>
                {formatCurrency(subscription.unitAmount)}
                {formatInterval(subscription.interval ?? undefined)}
              </span>
            </div>
          )}
          {nextRenewal && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>Próxima renovação: {nextRenewal}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
