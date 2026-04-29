"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useKeycloak } from "@/lib/keycloak";
import { useCredit } from "@/lib/credit-context";

import {
  Coins,
  CreditCard,
  RefreshCw,
  History,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";

import { StripeProduct, SubscriptionInfo } from "@/types/package";

import { getProducts, verifyPayment } from "@/service/credits";

import { CreditsCard } from "@/components/root/credtis/credit-card";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/common/loader";
import { PurchaseHistory } from "@/components/root/credtis/purchase-history";
import { CreditLots } from "@/components/root/credtis/credit-lots";
import { ActiveSubscription } from "@/components/root/credtis/active-subscription";

function Page() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  const { token, authenticated, keycloak, isCompanyAdmin } = useKeycloak();

  useEffect(() => {
    if (!isCompanyAdmin) {
      router.replace("/historico");
    }
  }, [isCompanyAdmin, router]);

  if (!isCompanyAdmin) {
    return null;
  }
  const {
    credits: currentCredits,
    loading: creditsLoading,
    refreshCredits,
  } = useCredit();

  const recurringProducts = useMemo(
    () => products.filter((p) => p.type === "recurring"),
    [products],
  );
  const oneTimeProducts = useMemo(
    () => products.filter((p) => p.type === "one_time"),
    [products],
  );

  const handleVerifyPayment = async () => {
    if (!token || !sessionId) return;
    setVerifyingPayment(true);

    try {
      const response = await verifyPayment({ token, sessionId });

      if (response instanceof Error) {
        toast.error(response.message);
        setVerifyingPayment(false);
        return;
      }

      if (response) {
        toast.success("Pagamento confirmado e créditos adicionados!");
        await refreshCredits();
      } else {
        toast.error("Pagamento não confirmado. Tente novamente.");
      }
    } catch (e) {
      console.error("Verification failed", e);
      toast.error("Ocorreu um erro ao verificar o pagamento.");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleGetProducts = async () => {
    if (!token) return;
    setLoadingProducts(true);

    try {
      const response = await getProducts({ token });

      if (response instanceof Error) {
        toast.error(response.message);
        setLoadingProducts(false);
        return;
      }

      setProducts(response);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSubscription = useCallback(async () => {
    if (!token) return;
    setLoadingSubscription(true);
    try {
      const { getActiveSubscription } = await import("@/service/credits");
      const sub = await getActiveSubscription({ token });
      setSubscription(sub);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoadingSubscription(false);
    }
  }, [token]);

  useEffect(() => {
    if (success && sessionId && token) {
      handleVerifyPayment();
    } else if (success) {
      toast.success("Pagamento realizado! Verificando créditos...");
    }

    if (canceled) {
      toast.error("Pagamento cancelado.");
    }

    if (authenticated) {
      handleGetProducts();
      fetchSubscription();
    }
  }, [success, canceled, token, authenticated, keycloak, fetchSubscription]);

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-10">
      {/* Current Balance Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary/80 font-medium">
            Saldo Disponível
          </CardDescription>
          <CardTitle className="text-4xl font-bold flex items-center gap-2">
            <Coins className="h-8 w-8" />
            {creditsLoading || verifyingPayment ? (
              <Loader size={8} />
            ) : (
              currentCredits
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary/70">
            Utilize seus créditos para validar áudios e gerar relatórios.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Seus créditos possuem data de validade. Consulte a aba
            &quot;Validade dos Créditos&quot;.
          </p>
        </CardContent>
      </Card>

      {/* Active Subscription */}
      <ActiveSubscription
        subscription={subscription}
        loading={loadingSubscription}
        onCancelled={fetchSubscription}
      />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="plans"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            Planos e Pacotes
          </TabsTrigger>
          <TabsTrigger
            value="validity"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CalendarClock className="h-4 w-4" />
            Validade dos Créditos
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 cursor-pointer"
          >
            <History className="h-4 w-4" />
            Histórico de Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-10 mt-6">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={8} />
            </div>
          ) : (
            <>
              {/* Recurring Plans */}
              {recurringProducts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Planos Recorrentes
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Receba créditos automaticamente a cada cobrança. Cancele
                    quando quiser.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recurringProducts.map((product) => (
                      <CreditsCard
                        product={product}
                        token={token}
                        type="recurring"
                        key={product.productId}
                        hasActiveSubscription={!!subscription}
                        isCurrentPlan={subscription?.planName === product.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* One-time Packages */}
              {oneTimeProducts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pacotes Avulsos
                    </>
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Compra única de créditos sem compromisso.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {oneTimeProducts.map((product) => (
                      <CreditsCard
                        product={product}
                        token={token}
                        type="one_time"
                        key={product.productId}
                        hasActiveSubscription={!!subscription}
                      />
                    ))}
                  </div>
                </div>
              )}

              {products.length === 0 && (
                <Card>
                  <CardContent className="text-center py-10 text-muted-foreground">
                    Nenhum produto disponível no momento.
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="validity" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Validade dos Créditos</h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe a validade dos seus lotes de créditos e veja quais
                estão próximos de expirar.
              </p>
            </div>
            <CreditLots />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Histórico de Transações</h2>
              <p className="text-sm text-muted-foreground">
                Veja todas as compras de créditos realizadas e quem as efetuou.
              </p>
            </div>
            <PurchaseHistory />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Page;
