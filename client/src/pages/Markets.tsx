import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar,
  RefreshCw,
  Clock,
  BarChart3,
  Coins,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Markets() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { data: indices, isLoading: indicesLoading, refetch: refetchIndices } = trpc.markets.indices.useQuery();
  const { data: commodities, isLoading: commoditiesLoading, refetch: refetchCommodities } = trpc.markets.commodities.useQuery();
  const { data: calendar, isLoading: calendarLoading } = trpc.markets.calendar.useQuery();

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchIndices();
      refetchCommodities();
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchIndices, refetchCommodities]);

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMs < 0) {
      // Evento passado
      return "Concluído";
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }
  };

  const getImportanceStars = (importance: number) => {
    return "★".repeat(importance) + "☆".repeat(3 - importance);
  };

  const getImportanceColor = (importance: number) => {
    switch (importance) {
      case 3: return "text-red-500";
      case 2: return "text-yellow-500";
      default: return "text-muted-foreground";
    }
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
            <Link href="/markets" className="text-sm font-medium text-foreground">
              Mercados
            </Link>
            <Link href="/calculator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Calculadora
            </Link>
            <Link href="/focus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Focus
            </Link>
            <Link href="/data" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mercados Globais</h1>
            <p className="text-muted-foreground mt-1">
              Cotações das principais bolsas e calendário econômico
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
            </div>
            <button
              onClick={() => {
                refetchIndices();
                refetchCommodities();
                setLastUpdate(new Date());
              }}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Indices and Commodities */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="indices" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="indices" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Índices Globais
                </TabsTrigger>
                <TabsTrigger value="commodities" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Commodities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="indices" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Principais Bolsas</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Dados em tempo real
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {indicesLoading ? (
                      <div className="space-y-3">
                        {[...Array(10)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                              <th className="text-left py-3 px-2">Nome</th>
                              <th className="text-right py-3 px-2">Último</th>
                              <th className="text-right py-3 px-2">Máxima</th>
                              <th className="text-right py-3 px-2">Mínima</th>
                              <th className="text-right py-3 px-2">Variação</th>
                              <th className="text-right py-3 px-2">Var. %</th>
                              <th className="text-right py-3 px-2">Hora</th>
                            </tr>
                          </thead>
                          <tbody>
                            {indices?.map((index) => (
                              <tr
                                key={index.symbol}
                                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                              >
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{index.flag}</span>
                                    <span className="font-medium">{index.name}</span>
                                  </div>
                                </td>
                                <td className="text-right py-3 px-2 font-mono">
                                  {formatNumber(index.price)}
                                </td>
                                <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                                  {formatNumber(index.high)}
                                </td>
                                <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                                  {formatNumber(index.low)}
                                </td>
                                <td className={`text-right py-3 px-2 font-mono ${
                                  index.change >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                  {index.change >= 0 ? "+" : ""}{formatNumber(index.change)}
                                </td>
                                <td className={`text-right py-3 px-2 font-mono ${
                                  index.changePercent >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                  <div className="flex items-center justify-end gap-1">
                                    {index.changePercent >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {index.changePercent >= 0 ? "+" : ""}{formatNumber(index.changePercent)}%
                                  </div>
                                </td>
                                <td className="text-right py-3 px-2 text-xs text-muted-foreground">
                                  {new Date(index.lastUpdate).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="commodities" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Commodities e Moedas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {commoditiesLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                              <th className="text-left py-3 px-2">Nome</th>
                              <th className="text-right py-3 px-2">Último</th>
                              <th className="text-right py-3 px-2">Máxima</th>
                              <th className="text-right py-3 px-2">Mínima</th>
                              <th className="text-right py-3 px-2">Variação</th>
                              <th className="text-right py-3 px-2">Var. %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {commodities?.map((commodity) => (
                              <tr
                                key={commodity.symbol}
                                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                              >
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{commodity.flag}</span>
                                    <span className="font-medium">{commodity.name}</span>
                                  </div>
                                </td>
                                <td className="text-right py-3 px-2 font-mono">
                                  {commodity.symbol.includes("BRL") ? "R$ " : "$ "}
                                  {formatNumber(commodity.price)}
                                </td>
                                <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                                  {formatNumber(commodity.high)}
                                </td>
                                <td className="text-right py-3 px-2 font-mono text-muted-foreground">
                                  {formatNumber(commodity.low)}
                                </td>
                                <td className={`text-right py-3 px-2 font-mono ${
                                  commodity.change >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                  {commodity.change >= 0 ? "+" : ""}{formatNumber(commodity.change)}
                                </td>
                                <td className={`text-right py-3 px-2 font-mono ${
                                  commodity.changePercent >= 0 ? "text-green-500" : "text-red-500"
                                }`}>
                                  <div className="flex items-center justify-end gap-1">
                                    {commodity.changePercent >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {commodity.changePercent >= 0 ? "+" : ""}{formatNumber(commodity.changePercent)}%
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Economic Calendar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Calendário Econômico</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Próximos eventos que podem impactar o mercado brasileiro
                </p>
              </CardHeader>
              <CardContent>
                {calendarLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {calendar?.slice(0, 15).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg hover:bg-accent/50 transition-colors border-l-2"
                        style={{
                          borderLeftColor: event.importance === 3 ? "#ef4444" : event.importance === 2 ? "#eab308" : "#6b7280"
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{event.flag}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.currency}
                              </Badge>
                              <span className={`text-xs ${getImportanceColor(event.importance)}`}>
                                {getImportanceStars(event.importance)}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate">{event.event}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {event.actual && (
                                <span>
                                  Atual: <span className="text-foreground font-medium">{event.actual}</span>
                                </span>
                              )}
                              {event.forecast && (
                                <span>
                                  Proj: <span className="text-foreground">{event.forecast}</span>
                                </span>
                              )}
                              {event.previous && (
                                <span>
                                  Ant: <span className="text-muted-foreground">{event.previous}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-primary">
                              {formatTime(event.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium mb-3">Importância dos Eventos</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">★★★</span>
                    <span>Alta - Grande impacto no mercado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★★☆</span>
                    <span>Média - Impacto moderado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">★☆☆</span>
                    <span>Baixa - Impacto limitado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
