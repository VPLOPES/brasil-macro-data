import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Focus() {
  const { data: focusData, isLoading, refetch } = trpc.focus.summary.useQuery();

  const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getIndicatorUnit = (indicator: string) => {
    if (indicator === "Câmbio") return "R$";
    return "%";
  };

  const getIndicatorDescription = (indicator: string) => {
    const descriptions: Record<string, string> = {
      IPCA: "Expectativa de inflação oficial medida pelo IBGE",
      "PIB Total": "Expectativa de crescimento do Produto Interno Bruto",
      Selic: "Expectativa para a taxa básica de juros ao final do ano",
      Câmbio: "Expectativa para a cotação do dólar ao final do ano",
      "IGP-M": "Expectativa para o Índice Geral de Preços - Mercado",
    };
    return descriptions[indicator] || "";
  };

  const getChangeIndicator = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (diff > 0) return <ArrowUp className="h-3 w-3 text-destructive" />;
    return <ArrowDown className="h-3 w-3 text-success" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-3 ml-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Boletim Focus</h1>
                <p className="text-xs text-muted-foreground">Expectativas de Mercado</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </header>

      <main className="container py-8">
        {/* Intro */}
        <section className="mb-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-2">Expectativas do Mercado</h2>
            <p className="text-muted-foreground">
              O Boletim Focus é uma publicação semanal do Banco Central do Brasil que
              reúne as expectativas de mercado para os principais indicadores
              econômicos. As projeções são coletadas junto a mais de 100 instituições
              financeiras e consultorias.
            </p>
          </div>
        </section>

        {/* Main Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-16 bg-muted rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {focusData?.map((item) => {
                const currentYearProj = item.projections.find(
                  (p) => p.year === item.currentYear
                );
                return (
                  <Card key={item.indicator} className="indicator-card">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.indicator}
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        {formatValue(currentYearProj?.median)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {getIndicatorUnit(item.indicator)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Projeção {item.currentYear}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {focusData?.map((item) => (
                <Card key={item.indicator}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          {item.indicator}
                        </CardTitle>
                        <CardDescription>
                          {getIndicatorDescription(item.indicator)}
                        </CardDescription>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Atualizado semanalmente
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {item.projections.map((proj, index) => {
                        const prevProj = item.projections[index - 1];
                        return (
                          <div
                            key={proj.year}
                            className={cn(
                              "p-4 rounded-lg border",
                              proj.year === item.currentYear
                                ? "bg-primary/5 border-primary/20"
                                : "bg-muted/30 border-border"
                            )}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold">{proj.year}</span>
                              <div className="flex items-center gap-2">
                                {getChangeIndicator(proj.median, prevProj?.median)}
                                <span className="text-xl font-bold tabular-nums">
                                  {formatValue(proj.median)}
                                  <span className="text-sm font-normal text-muted-foreground ml-1">
                                    {getIndicatorUnit(item.indicator)}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Mínimo</p>
                                <p className="font-medium tabular-nums">
                                  {formatValue(proj.min)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Média</p>
                                <p className="font-medium tabular-nums">
                                  {formatValue(proj.mean)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Máximo</p>
                                <p className="font-medium tabular-nums">
                                  {formatValue(proj.max)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Info Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sobre o Boletim Focus</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  O <strong>Relatório Focus</strong> é uma publicação semanal do Banco
                  Central do Brasil que divulga as expectativas de mercado para os
                  principais indicadores da economia brasileira.
                </p>
                <p>
                  As projeções são coletadas junto a mais de 100 instituições
                  financeiras, consultorias e entidades representativas de diversos
                  setores da economia. O relatório é publicado toda segunda-feira e
                  serve como importante referência para decisões de política monetária.
                </p>
                <p>
                  Os valores apresentados representam a <strong>mediana</strong> das
                  expectativas coletadas, ou seja, o valor central da distribuição das
                  projeções. Também são disponibilizados os valores mínimo, máximo e a
                  média das projeções.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
