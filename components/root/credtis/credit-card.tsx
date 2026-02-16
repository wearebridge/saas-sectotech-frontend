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
import { formatCurrency, formatInterval } from "@/lib/utils";
import { buyCredits } from "@/service/credits";
import { StripeProduct } from "@/types/package";
import { Coins, CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreditsCardProps {
  product: StripeProduct;
  token: string | undefined;
  type: "one_time" | "recurring";
}

export function CreditsCard({ product, token, type }: CreditsCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async (priceId: string) => {
    if (!token) {
      toast.error("Você precisa estar logado para comprar créditos.");
      return;
    }
    setIsLoading(true);

    try {
      const url = await buyCredits({ priceId, token: token });

      if (url instanceof Error) {
        toast.error(url.message);
        return;
      }

      window.location.href = url;
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
      className="flex flex-col relative overflow-hidden transition-all hover:shadow-md border-muted"
    >
      {type === "one_time" ? (
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
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={() => handleBuy(product.priceId)}
          isLoading={isLoading}
          className="w-full"
          size="lg"
          variant={"sectotech"}
        >
          Comprar Agora
        </Button>
      </CardFooter>
    </Card>
  );
}
