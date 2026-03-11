"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  CalendarDays,
  Coins,
  FileText,
  Filter,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardTable } from "@/components/root/dashboard/dashboard-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeycloak } from "@/lib/keycloak";
import { getDashboard } from "@/service/dashboard";
import { DashboardResponse } from "@/types/dashboard";

const monthOptions = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 6 },
  (_, index) => currentYear - index,
);

const chartConfig = {
  creditsUsed: {
    label: "Créditos usados",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const creditFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("pt-BR");

type SummaryCard = {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  support: string;
};

export function HomeDashboard() {
  const { authenticated, token } = useKeycloak();
  const today = React.useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = React.useState(
    String(today.getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = React.useState(
    String(today.getFullYear()),
  );
  const [dashboard, setDashboard] = React.useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      if (!authenticated || !token) return;

      setLoading(true);

      const result = await getDashboard({
        month: Number(selectedMonth),
        year: Number(selectedYear),
        token,
      });

      if (result instanceof Error) {
        toast.error(result.message || "Erro ao carregar dashboard");
        setDashboard(null);
        setLoading(false);
        return;
      }

      setDashboard(result);
      setLoading(false);
    };

    fetchDashboard();
  }, [authenticated, selectedMonth, selectedYear, token]);

  const selectedMonthLabel = React.useMemo(() => {
    return monthOptions.find((month) => month.value === Number(selectedMonth))
      ?.label;
  }, [selectedMonth]);

  const periodLabel = React.useMemo(() => {
    return `${selectedMonthLabel ?? "Período selecionado"} de ${selectedYear}`;
  }, [selectedMonthLabel, selectedYear]);

  const summaryCards = React.useMemo<SummaryCard[]>(() => {
    if (!dashboard) return [];

    return [
      {
        title: "Total de créditos",
        value: creditFormatter.format(dashboard.currentCreditBalance ?? 0),
        icon: Coins,
        support: "Saldo disponível",
      },
      {
        title: "Total de clientes",
        value: integerFormatter.format(dashboard.totalClients ?? 0),
        icon: Users,
        support: "Clientes cadastrados",
      },
      {
        title: "Total de usuários",
        value: integerFormatter.format(dashboard.totalUsers ?? 0),
        icon: UsersRound,
        support: "Usuários da empresa",
      },
      {
        title: "Total de scripts",
        value: integerFormatter.format(dashboard.totalScripts ?? 0),
        icon: FileText,
        support: "Scripts disponíveis",
      },
    ];
  }, [dashboard]);

  const chartData = React.useMemo(() => {
    if (!dashboard) return [];

    const groupedUsage = new Map<
      string,
      { dateLabel: string; creditsUsed: number }
    >();

    for (const transaction of dashboard.creditTransactions ?? []) {
      const amount = Number(transaction.amount ?? 0);
      const isUsage = transaction.sourceType === "USAGE" || amount < 0;
      if (!isUsage) continue;

      const transactionDate = new Date(transaction.createdAt);
      const key = format(transactionDate, "yyyy-MM-dd");
      const existingEntry = groupedUsage.get(key);

      groupedUsage.set(key, {
        dateLabel: format(transactionDate, "dd/MM", { locale: ptBR }),
        creditsUsed: Number(
          ((existingEntry?.creditsUsed ?? 0) + Math.abs(amount)).toFixed(2),
        ),
      });
    }

    return Array.from(groupedUsage.entries())
      .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
      .map(([, value]) => value);
  }, [dashboard]);

  const usageTotal = React.useMemo(() => {
    return Math.abs(dashboard?.totalCreditsUsed ?? 0);
  }, [dashboard]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <Card className="border-border/60 bg-linear-to-br from-card via-card to-muted/50">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
                <CalendarDays className="h-4 w-4" />
                Dashboard operacional
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Visão geral da operação
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm sm:text-base">
                Acompanhe os indicadores mais importantes de {periodLabel} com
                leitura rápida de saldo, uso de créditos e atividade da empresa.
              </CardDescription>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:max-w-md lg:w-auto lg:max-w-none">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="h-8 rounded-full px-3">
              <Filter className="mr-1 h-3.5 w-3.5" />
              {periodLabel}
            </Badge>
            <Badge variant="outline" className="h-8 rounded-full px-3">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              {loading
                ? "Atualizando indicadores"
                : `${integerFormatter.format(chartData.length)} dia(s) com consumo`}
            </Badge>
            <Badge variant="outline" className="h-8 rounded-full px-3">
              <Activity className="mr-1 h-3.5 w-3.5" />
              {loading
                ? "..."
                : `${integerFormatter.format(dashboard?.totalAnalysesInPeriod ?? 0)} análises`}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))
          : summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card
                  key={card.title}
                  className="border-border/60 bg-card/90 overflow-hidden"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
                    <div className="space-y-1">
                      <CardDescription>{card.title}</CardDescription>
                      <CardTitle className="text-3xl font-semibold tracking-tight sm:text-[2rem]">
                        {card.value}
                      </CardTitle>
                    </div>
                    <div className="bg-muted text-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="text-muted-foreground text-sm">
                      {card.support}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="border-border/60">
          <CardHeader className="gap-3 pb-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <CardTitle>Uso de créditos</CardTitle>
                <CardDescription>
                  Consumo agrupado por dia em {periodLabel}.
                </CardDescription>
              </div>
              <div className="bg-muted/50 flex flex-col rounded-xl border px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Consumo total</span>
                <span className="text-xl font-semibold">
                  {loading
                    ? "..."
                    : `${creditFormatter.format(usageTotal)} créditos`}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <Skeleton className="h-85 w-full" />
            ) : chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-85 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="dateLabel"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) =>
                      creditFormatter.format(value)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `${creditFormatter.format(Number(value))} créditos`,
                          "Créditos usados",
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="creditsUsed"
                    radius={[10, 10, 0, 0]}
                    fill="var(--color-creditsUsed)"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground flex h-85 items-center justify-center rounded-xl border border-dashed text-sm">
                Nenhum consumo de crédito encontrado para o período selecionado.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="gap-1">
            <CardTitle>Resumo do período</CardTitle>
            <CardDescription>
              Leitura rápida dos números mais relevantes de {periodLabel}.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <Skeleton className="mb-3 h-3 w-28" />
                    <Skeleton className="mb-2 h-7 w-18" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))
              : [
                  {
                    label: "Período analisado",
                    value: periodLabel,
                    description:
                      "Filtro ativo aplicado sobre os dados consolidados.",
                  },
                  {
                    label: "Saldo disponível",
                    value: `${creditFormatter.format(dashboard?.currentCreditBalance ?? 0)} créditos`,
                    description:
                      "Saldo atual da empresa, independente do histórico filtrado.",
                  },
                  {
                    label: "Volume de uso",
                    value: `${integerFormatter.format(chartData.length)} dia(s) com consumo`,
                    description:
                      "Quantidade de dias do período com débitos registrados.",
                  },
                  {
                    label: "Movimentações retornadas",
                    value: integerFormatter.format(
                      dashboard?.creditTransactions.length ?? 0,
                    ),
                    description:
                      "Transações de crédito consideradas pelo endpoint da dashboard.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-muted/30 rounded-xl border p-4"
                  >
                    <div className="text-muted-foreground text-sm">
                      {item.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold leading-tight">
                      {item.value}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Últimas 5 análises</CardTitle>
            <CardDescription>
              Histórico recente para acompanhamento rápido da operação.
            </CardDescription>
          </div>
          <Link href="/historico" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Ver histórico completo
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <DashboardTable isHomeView={true} />
        </CardContent>
      </Card>
    </div>
  );
}
