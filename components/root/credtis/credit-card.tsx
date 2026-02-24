"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatCurrency, formatInterval } from "@/lib/utils";
import { buyCredits } from "@/service/credits";
import { StripeProduct } from "@/types/package";
import {
  Coins,
  CreditCard,
  RefreshCw,
  CheckCircle,
  CalendarClock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors/error-utils";

interface CreditsCardProps {
  product: StripeProduct;
  token: string | undefined;
  type: "one_time" | "recurring";
  hasActiveSubscription?: boolean;
  isCurrentPlan?: boolean;
}

export function CreditsCard({
  product,
  token,
  type,
  hasActiveSubscription,
  isCurrentPlan,
}: CreditsCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async (priceId: string) => {
    if (!token) {
      toast.error("Você precisa estar logado para comprar créditos.");
      return;
    }
    setIsLoading(true);

    try {
      const url = await buyCredits({ priceId, token: token });

      const errorMessage = getErrorMessage(url);
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }

      window.location.href = url as string;
    } catch (err) {
      console.error(err);
      toast.error("Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      key={product.priceId}
      className={`flex flex-col relative overflow-hidden transition-all hover:shadow-md ${
        isCurrentPlan ? "border-primary ring-2 ring-primary/20" : "border-muted"
      }`}
    >
      {isCurrentPlan ? (
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Plano Atual
          </Badge>
        </div>
      ) : type === "one_time" ? (
        <div className="absolute top-0 right-0 p-3 bg-muted/50 rounded-bl-xl">
          <Coins className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="secondary">Recorrente</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <CardDescription className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {product.credits}
          </span>
          {type === "one_time" ? (
            <span>créditos</span>
          ) : (
            <span>créditos{formatInterval(product.interval)}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-6">
        <div className="text-2xl font-bold text-primary">
          {type === "one_time" ? (
            <> {formatCurrency(product.unitAmount)}</>
          ) : (
            <>
              {formatCurrency(product.unitAmount)}
              {formatInterval(product.interval)}
            </>
          )}
        </div>
        {product.description ? (
          <p className="text-sm text-muted-foreground mt-2">
            {product.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            {type === "one_time"
              ? "Pagamento único"
              : `${product.description ?? ""}`}
          </p>
        )}
        {type === "one_time" && (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
            <CalendarClock className="h-3.5 w-3.5" />
            Validade: 30 dias
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        {isCurrentPlan ? (
          <Button className="w-full" size="lg" variant="outline" disabled>
            Plano Atual
          </Button>
        ) : hasActiveSubscription && type === "recurring" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                isLoading={isLoading}
                className="w-full"
                size="lg"
                variant="sectotech"
              >
                Trocar Plano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Trocar de plano?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ao trocar de plano, sua assinatura atual será cancelada
                  imediatamente e uma nova assinatura será criada com o plano
                  selecionado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBuy(product.priceId)}>
                  Confirmar Troca
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={() => handleBuy(product.priceId)}
            isLoading={isLoading}
            className="w-full"
            size="lg"
            variant={"sectotech"}
          >
            Comprar Agora
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
