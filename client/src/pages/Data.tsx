import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Database,
  Building2,
  Globe2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Factory,
  Landmark,
} from "lucide-react";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function Data() {
  const { data: tesouroData, isLoading: tesouroLoading } = trpc.external.tesouro.getData.useQuery();
  const { data: cagedData, isLoading: cagedLoading } = trpc.external.caged.getData.useQuery();
  const { data: fredData, isLoading: fredLoading } = trpc.external.fred.getAllSeries.useQuery();
  const { data: brasilApiTaxes, isLoading: taxesLoading } = trpc.external.brasilApi.taxes.useQuery();

  const formatNumber = (num: number, decimals = 2) => {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getSectorColor = (index: number) => {
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Brasil Macro Data</h1>
              <p className="text-xs text-muted-foreground">Indicadores Econômicos em Tempo Real</p>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Mercados
            </Link>
            <Link href="/calculator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Calculadora
            </Link>
            <Link href="/focus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Focus
            </Link>
            <Link href="/data" className="text-sm font-medium text-foreground">
              Dados
            </Link>
            <Link href="/api" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              API
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">Banco de Dados Econômicos</h1>
          <p className="text-muted-foreground mt-1">
            Dados integrados de múltiplas fontes oficiais brasileiras e internacionais
          </p>
        </div>

        {/* Data Sources */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tesouro Nacional</p>
                  <p className="text-xs text-muted-foreground">Dados Fiscais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">CAGED/MTE</p>
                  <p className="text-xs text-muted-foreground">Emprego Formal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Globe2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">FRED</p>
                  <p className="text-xs text-muted-foreground">Federal Reserve</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">BrasilAPI</p>
                  <p className="text-xs text-muted-foreground">APIs Modernas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fiscal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Fiscal
            </TabsTrigger>
            <TabsTrigger value="emprego" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Emprego
            </TabsTrigger>
            <TabsTrigger value="internacional" className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Internacional
            </TabsTrigger>
            <TabsTrigger value="taxas" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Taxas
            </TabsTrigger>
          </TabsList>

          {/* Fiscal Tab - Tesouro Nacional */}
          <TabsContent value="fiscal" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Dados do Tesouro Nacional
                  </CardTitle>
                  <CardDescription>
                    Indicadores fiscais do governo federal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tesouroLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tesouroData?.map((item) => (
                        <div
                          key={item.indicator}
                          className="p-4 rounded-lg bg-accent/30 border border-border/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.period} • {item.source}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                item.value < 0 ? "text-red-500" : "text-green-500"
                              }`}>
                                {item.value < 0 ? "" : "+"}{formatNumber(item.value)}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.unit}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral Fiscal</CardTitle>
                  <CardDescription>
                    Principais métricas do governo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tesouroLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="space-y-6">
                      {/* Dívida Bruta */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dívida Bruta/PIB</span>
                          <span className="text-lg font-bold text-red-500">
                            {tesouroData?.find(d => d.indicator === "DIVIDA_BRUTA")?.value || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-3">
                          <div
                            className="bg-red-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min((tesouroData?.find(d => d.indicator === "DIVIDA_BRUTA")?.value || 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Dívida Líquida */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dívida Líquida/PIB</span>
                          <span className="text-lg font-bold text-orange-500">
                            {tesouroData?.find(d => d.indicator === "DIVIDA_LIQUIDA")?.value || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-3">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min((tesouroData?.find(d => d.indicator === "DIVIDA_LIQUIDA")?.value || 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Juros Nominais */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Juros Nominais/PIB (12M)</span>
                          <span className="text-lg font-bold text-yellow-500">
                            {tesouroData?.find(d => d.indicator === "JUROS_NOMINAIS")?.value || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-3">
                          <div
                            className="bg-yellow-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.min((tesouroData?.find(d => d.indicator === "JUROS_NOMINAIS")?.value || 0) * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emprego Tab - CAGED */}
          <TabsContent value="emprego" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admissões</p>
                      <p className="text-2xl font-bold text-green-500">
                        {cagedLoading ? "..." : formatNumber(cagedData?.admissions || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Desligamentos</p>
                      <p className="text-2xl font-bold text-red-500">
                        {cagedLoading ? "..." : formatNumber(cagedData?.dismissals || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                      <p className={`text-2xl font-bold ${
                        (cagedData?.totalBalance || 0) >= 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {cagedLoading ? "..." : (cagedData?.totalBalance || 0) >= 0 ? "+" : ""}
                        {formatNumber(cagedData?.totalBalance || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* By Sector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-primary" />
                    Saldo por Setor
                  </CardTitle>
                  <CardDescription>
                    {cagedData?.period || "Carregando..."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cagedLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={cagedData?.bySector}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="sector"
                          tick={{ fill: "var(--foreground)", fontSize: 12 }}
                          width={75}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [formatNumber(value), "Saldo"]}
                        />
                        <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                          {cagedData?.bySector.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={getSectorColor(index)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Accumulated */}
              <Card>
                <CardHeader>
                  <CardTitle>Acumulado 12 Meses</CardTitle>
                  <CardDescription>
                    Criação líquida de empregos formais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cagedLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="text-6xl font-bold text-primary">
                        +{formatNumber(cagedData?.accumulated12Months || 0)}
                      </div>
                      <p className="text-muted-foreground mt-2">empregos criados</p>
                      <Badge variant="outline" className="mt-4">
                        Fonte: CAGED/MTE
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Internacional Tab - FRED */}
          <TabsContent value="internacional" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" />
                  Indicadores dos EUA (FRED)
                </CardTitle>
                <CardDescription>
                  Dados do Federal Reserve para comparações internacionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fredLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {fredData?.map((series) => {
                      const latestValue = series.data[series.data.length - 1]?.value || 0;
                      const previousValue = series.data[series.data.length - 2]?.value || latestValue;
                      const change = latestValue - previousValue;
                      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

                      return (
                        <Card key={series.id} className="bg-accent/30">
                          <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground truncate">{series.title}</p>
                            <p className="text-2xl font-bold mt-1">
                              {formatNumber(latestValue)}
                            </p>
                            <p className="text-xs text-muted-foreground">{series.units}</p>
                            <div className={`flex items-center gap-1 mt-2 text-xs ${
                              change >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                              {change >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {change >= 0 ? "+" : ""}{formatNumber(changePercent)}%
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chart for selected FRED series */}
            {!fredLoading && fredData && fredData.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Federal Funds Rate - Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={fredData.find(s => s.id === "FEDFUNDS")?.data || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
                        }}
                      />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString("pt-BR")}
                        formatter={(value: number) => [`${formatNumber(value)}%`, "Fed Funds Rate"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Taxas Tab - BrasilAPI */}
          <TabsContent value="taxas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {taxesLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))
              ) : (
                brasilApiTaxes?.map((tax) => (
                  <Card key={tax.name} className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Taxa {tax.name}</p>
                          <p className="text-4xl font-bold text-primary mt-2">
                            {formatNumber(tax.value)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Atualizado: {new Date(tax.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <DollarSign className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sobre as Fontes de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">BrasilAPI</h4>
                    <p className="text-muted-foreground">
                      API moderna com CDN que fornece dados atualizados de taxas de juros,
                      feriados nacionais e outras informações públicas do Brasil.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">FRED (Federal Reserve)</h4>
                    <p className="text-muted-foreground">
                      Base de dados econômicos do Federal Reserve dos EUA, essencial para
                      comparações internacionais e análise de impacto global.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tesouro Nacional</h4>
                    <p className="text-muted-foreground">
                      Dados fiscais oficiais do governo brasileiro, incluindo dívida pública,
                      resultado primário e outras métricas fiscais.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">CAGED/MTE</h4>
                    <p className="text-muted-foreground">
                      Cadastro Geral de Empregados e Desempregados do Ministério do Trabalho,
                      com dados mensais de criação e destruição de empregos formais.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
