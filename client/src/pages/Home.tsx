import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorCard } from "@/components/IndicatorCard";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Building2,
  Globe,
  Calculator,
  FileDown,
  Bell,
  ChevronRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import NewsSection from "@/components/NewsSection";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedIndicator, setSelectedIndicator] = useState<string>("IPCA");

  // Fetch indicators summary
  const { data: indicators, isLoading: loadingIndicators, refetch } = trpc.indicators.summary.useQuery(
    undefined,
    { refetchInterval: 300000 } // Refresh every 5 minutes
  );

  // Fetch selected indicator data for chart
  const { data: chartData, isLoading: loadingChart } = trpc.indicators.getData.useQuery(
    { code: selectedIndicator, periods: 60 },
    { enabled: !!selectedIndicator }
  );

  // Fetch Focus summary
  const { data: focusData, isLoading: loadingFocus } = trpc.focus.summary.useQuery();

  const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getIndicatorIcon = (category: string) => {
    switch (category) {
      case "inflation":
        return <Percent className="h-4 w-4" />;
      case "interest":
        return <TrendingUp className="h-4 w-4" />;
      case "exchange":
        return <DollarSign className="h-4 w-4" />;
      case "activity":
        return <BarChart3 className="h-4 w-4" />;
      case "employment":
        return <Building2 className="h-4 w-4" />;
      case "external":
        return <Globe className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Brasil Macro Data</h1>
              <p className="text-xs text-muted-foreground">Indicadores Econômicos em Tempo Real</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/calculator" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Calculadora
            </Link>
            <Link href="/focus" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Focus
            </Link>
            <Link href="/api" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              API
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/alerts">
                  <Bell className="h-4 w-4 mr-2" />
                  Alertas
                </Link>
              </Button>
            ) : (
              <Button variant="default" size="sm" asChild>
                <a href="/api/oauth/login">Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Painel de Indicadores</h2>
              <p className="text-muted-foreground">
                Dados atualizados das principais fontes oficiais: BCB, IBGE e Focus
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="live-indicator pl-4">Dados em tempo real</span>
            </div>
          </div>

          {/* Main Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loadingIndicators ? (
              Array.from({ length: 8 }).map((_, i) => (
                <IndicatorCard
                  key={i}
                  name=""
                  value={null}
                  unit=""
                  isLoading
                />
              ))
            ) : (
              indicators?.map((indicator) => (
                <IndicatorCard
                  key={indicator.code}
                  name={indicator.name}
                  description={indicator.description}
                  value={indicator.currentValue}
                  previousValue={indicator.previousValue}
                  change={indicator.change}
                  accumulated12m={indicator.accumulated12m}
                  accumulatedYTD={indicator.accumulatedYTD}
                  unit={indicator.unit}
                  lastUpdate={indicator.lastUpdate}
                  onClick={() => window.location.href = `/indicator/${indicator.code}`}
                />
              ))
            )}
          </div>
        </section>

        {/* Chart and Focus Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">
                {chartData?.name || selectedIndicator} - Série Histórica
              </CardTitle>
              <Tabs value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <TabsList className="h-8">
                  <TabsTrigger value="IPCA" className="text-xs px-2">IPCA</TabsTrigger>
                  <TabsTrigger value="SELIC" className="text-xs px-2">SELIC</TabsTrigger>
                  <TabsTrigger value="USD_BRL" className="text-xs px-2">Dólar</TabsTrigger>
                  <TabsTrigger value="UNEMPLOYMENT" className="text-xs px-2">Desemprego</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loadingChart ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData?.data ? (
                <TimeSeriesChart
                  data={chartData.data}
                  name={chartData.name}
                  unit={selectedIndicator === "USD_BRL" ? "R$" : "%"}
                  color="var(--chart-1)"
                  showArea
                  showZeroLine={selectedIndicator !== "USD_BRL"}
                  height={300}
                  dateFormat="month"
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Focus Expectations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Boletim Focus
              </CardTitle>
              <p className="text-xs text-muted-foreground">Expectativas do mercado</p>
            </CardHeader>
            <CardContent>
              {loadingFocus ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {focusData?.slice(0, 5).map((item) => {
                    const currentYearProj = item.projections.find(
                      (p) => p.year === item.currentYear
                    );
                    const nextYearProj = item.projections.find(
                      (p) => p.year === item.nextYear
                    );

                    return (
                      <div key={item.indicator} className="border-b border-border pb-3 last:border-0">
                        <p className="text-sm font-medium mb-1">{item.indicator}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground">{item.currentYear}:</span>{" "}
                            <span className="font-semibold tabular-nums">
                              {formatValue(currentYearProj?.median)}
                              {item.indicator === "Câmbio" ? "" : "%"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">{item.nextYear}:</span>{" "}
                            <span className="font-semibold tabular-nums">
                              {formatValue(nextYearProj?.median)}
                              {item.indicator === "Câmbio" ? "" : "%"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/focus" className="flex items-center gap-1 text-sm text-primary mt-4 hover:underline">
                Ver projeções completas <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* News Section */}
        <section className="mb-8">
          <NewsSection />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/calculator">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Calculadora de Correção</h3>
                  <p className="text-sm text-muted-foreground">
                    Corrija valores por IPCA, IGP-M, SELIC e mais
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/export">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileDown className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Exportar Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Baixe séries históricas em CSV ou Excel
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/api">
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Globe className="h-6 w-6" style={{ color: "var(--chart-3)" }} />
                </div>
                <div>
                  <h3 className="font-semibold">API para Empresas</h3>
                  <p className="text-sm text-muted-foreground">
                    Integre dados em seus sistemas
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              <p>Fontes: Banco Central do Brasil, IBGE, Boletim Focus</p>
              <p className="text-xs mt-1">
                Dados atualizados automaticamente. Última verificação:{" "}
                {new Date().toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-foreground transition-colors">
                Sobre
              </Link>
              <Link href="/api" className="hover:text-foreground transition-colors">
                API
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contato
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
