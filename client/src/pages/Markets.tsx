import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Calendar,
  RefreshCw,
  Clock,
  BarChart3,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useMemo } from "react";

type MarketQuote = {
  symbol: string;
  name: string;
  country: string;
  flag: string;
  region: string;
  category: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdate: string;
  marketStatus: string;
};

type EconomicEvent = {
  id: string;
  date: string;
  time: string;
  datetime: string;
  country: string;
  countryCode: string;
  flag: string;
  event: string;
  importance: 1 | 2 | 3;
  actual?: string;
  forecast?: string;
  previous?: string;
  category: string;
  unit?: string;
};

export default function Markets() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("indices");
  const [regionFilter, setRegionFilter] = useState("all");
  const [calendarFilter, setCalendarFilter] = useState("today");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: allMarkets, isLoading: marketsLoading, refetch: refetchMarkets } = trpc.markets.indices.useQuery();
  const { data: commodities, isLoading: commoditiesLoading, refetch: refetchCommodities } = trpc.markets.commodities.useQuery();
  const { data: currencies, isLoading: currenciesLoading, refetch: refetchCurrencies } = trpc.markets.currencies.useQuery();
  const { data: calendar, isLoading: calendarLoading } = trpc.markets.calendar.useQuery();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMarkets();
      refetchCommodities();
      refetchCurrencies();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchMarkets, refetchCommodities, refetchCurrencies]);

  // Filter indices by region
  const filteredIndices = useMemo(() => {
    if (!allMarkets) return [];
    let filtered = allMarkets;
    
    if (regionFilter !== "all") {
      filtered = filtered.filter((m: MarketQuote) => m.region === regionFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((m: MarketQuote) => 
        m.name.toLowerCase().includes(term) || 
        m.symbol.toLowerCase().includes(term) ||
        m.country.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [allMarkets, regionFilter, searchTerm]);

  // Filter calendar events
  const filteredCalendar = useMemo(() => {
    if (!calendar) return [];
    let filtered = [...calendar];
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
    const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0];
    
    // Filter by date range
    switch (calendarFilter) {
      case "yesterday":
        const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
        filtered = filtered.filter((e: EconomicEvent) => e.date === yesterday);
        break;
      case "today":
        filtered = filtered.filter((e: EconomicEvent) => e.date === today);
        break;
      case "tomorrow":
        filtered = filtered.filter((e: EconomicEvent) => e.date === tomorrow);
        break;
      case "week":
        filtered = filtered.filter((e: EconomicEvent) => e.date >= today && e.date <= weekEnd);
        break;
    }
    
    // Filter by importance
    if (importanceFilter !== "all") {
      const imp = parseInt(importanceFilter);
      filtered = filtered.filter((e: EconomicEvent) => e.importance >= imp);
    }
    
    // Filter by country
    if (countryFilter !== "all") {
      filtered = filtered.filter((e: EconomicEvent) => e.countryCode === countryFilter);
    }
    
    return filtered;
  }, [calendar, calendarFilter, importanceFilter, countryFilter]);

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatTime = (time: string) => {
    return time;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { 
      weekday: "long", 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  // Group calendar events by date
  const groupedCalendar = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {};
    for (const event of filteredCalendar) {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    }
    return groups;
  }, [filteredCalendar]);

  const renderMarketTable = (data: MarketQuote[] | undefined, loading: boolean, showRegion = false) => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum dado disponível
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase">
              <th className="text-left py-3 px-2 font-medium">Nome</th>
              <th className="text-right py-3 px-2 font-medium">Último</th>
              <th className="text-right py-3 px-2 font-medium">Máxima</th>
              <th className="text-right py-3 px-2 font-medium">Mínima</th>
              <th className="text-right py-3 px-2 font-medium">Variação</th>
              <th className="text-right py-3 px-2 font-medium">Var. %</th>
              <th className="text-right py-3 px-2 font-medium">Hora</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.symbol}
                className="border-b border-border/50 hover:bg-accent/30 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {showRegion && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {item.country}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-2 font-mono font-medium">
                  {formatNumber(item.price, item.category === "currency" ? 4 : 2)}
                </td>
                <td className="text-right py-3 px-2 font-mono text-muted-foreground text-sm">
                  {formatNumber(item.high, item.category === "currency" ? 4 : 2)}
                </td>
                <td className="text-right py-3 px-2 font-mono text-muted-foreground text-sm">
                  {formatNumber(item.low, item.category === "currency" ? 4 : 2)}
                </td>
                <td className={`text-right py-3 px-2 font-mono ${
                  item.change >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {item.change >= 0 ? "+" : ""}{formatNumber(item.change, item.category === "currency" ? 4 : 2)}
                </td>
                <td className={`text-right py-3 px-2 font-mono ${
                  item.changePercent >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  <div className="flex items-center justify-end gap-1">
                    {item.changePercent >= 0 ? "+" : ""}{formatNumber(item.changePercent)}%
                  </div>
                </td>
                <td className="text-right py-3 px-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-end gap-1">
                    {item.lastUpdate.split(" ")[1] || item.lastUpdate}
                    <Clock className="h-3 w-3 opacity-50" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Mercados</h1>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Horário atual: {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} (GMT-3)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchMarkets();
                refetchCommodities();
                refetchCurrencies();
                setLastUpdate(new Date());
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-auto">
            <TabsTrigger value="indices">Índices</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
            <TabsTrigger value="currencies">Moedas</TabsTrigger>
            <TabsTrigger value="calendar">Calendário Econômico</TabsTrigger>
          </TabsList>

          {/* Indices Tab */}
          <TabsContent value="indices" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl">Índices Globais</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar índice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Region Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant={regionFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRegionFilter("all")}
                  >
                    Principais
                  </Button>
                  <Button
                    variant={regionFilter === "americas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRegionFilter("americas")}
                  >
                    Américas
                  </Button>
                  <Button
                    variant={regionFilter === "europe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRegionFilter("europe")}
                  >
                    Europa
                  </Button>
                  <Button
                    variant={regionFilter === "asia" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRegionFilter("asia")}
                  >
                    Ásia e Oceania
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderMarketTable(filteredIndices, marketsLoading, true)}
                
                {filteredIndices.length > 0 && (
                  <div className="text-right mt-4">
                    <Button variant="link" className="text-primary">
                      Exibir todos os índices
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commodities Tab */}
          <TabsContent value="commodities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Commodities</CardTitle>
              </CardHeader>
              <CardContent>
                {renderMarketTable(commodities, commoditiesLoading)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Currencies Tab */}
          <TabsContent value="currencies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Moedas</CardTitle>
              </CardHeader>
              <CardContent>
                {renderMarketTable(currencies, currenciesLoading)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economic Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Calendário Econômico
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      Todos os dados são transmitidos e atualizados automaticamente
                    </span>
                  </div>
                  
                  {/* Calendar Filters */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={calendarFilter === "yesterday" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarFilter("yesterday")}
                    >
                      Ontem
                    </Button>
                    <Button
                      variant={calendarFilter === "today" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarFilter("today")}
                    >
                      Hoje
                    </Button>
                    <Button
                      variant={calendarFilter === "tomorrow" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarFilter("tomorrow")}
                    >
                      Amanhã
                    </Button>
                    <Button
                      variant={calendarFilter === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCalendarFilter("week")}
                    >
                      Esta semana
                    </Button>
                  </div>
                  
                  {/* Additional Filters */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">País:</span>
                      <Select value={countryFilter} onValueChange={setCountryFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="BRL">🇧🇷 Brasil</SelectItem>
                          <SelectItem value="USD">🇺🇸 EUA</SelectItem>
                          <SelectItem value="EUR">🇪🇺 Zona Euro</SelectItem>
                          <SelectItem value="GBP">🇬🇧 Reino Unido</SelectItem>
                          <SelectItem value="JPY">🇯🇵 Japão</SelectItem>
                          <SelectItem value="CNY">🇨🇳 China</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Importância:</span>
                      <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Qualquer</SelectItem>
                          <SelectItem value="3">★★★ Alta</SelectItem>
                          <SelectItem value="2">★★☆ Média+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Horário: GMT-3 (Brasília)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calendarLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : Object.keys(groupedCalendar).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum evento encontrado para os filtros selecionados
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedCalendar).map(([date, events]) => (
                      <div key={date}>
                        <div className="sticky top-0 bg-background py-2 mb-2">
                          <h3 className="text-sm font-medium text-muted-foreground capitalize">
                            {formatDate(date)}
                          </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                                <th className="text-left py-2 px-2 font-medium w-16">Hora</th>
                                <th className="text-left py-2 px-2 font-medium w-20">Moeda</th>
                                <th className="text-left py-2 px-2 font-medium">Evento</th>
                                <th className="text-center py-2 px-2 font-medium w-20">Import.</th>
                                <th className="text-right py-2 px-2 font-medium w-24">Atual</th>
                                <th className="text-right py-2 px-2 font-medium w-24">Projeção</th>
                                <th className="text-right py-2 px-2 font-medium w-24">Anterior</th>
                              </tr>
                            </thead>
                            <tbody>
                              {events.map((event) => (
                                <tr
                                  key={event.id}
                                  className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                                >
                                  <td className="py-3 px-2 text-sm font-medium">
                                    {formatTime(event.time)}
                                  </td>
                                  <td className="py-3 px-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-base">{event.flag}</span>
                                      <span className="text-xs font-medium">{event.countryCode}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className="text-sm">{event.event}</span>
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <span className={`text-sm ${getImportanceColor(event.importance)}`}>
                                      {getImportanceStars(event.importance)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-right">
                                    {event.actual ? (
                                      <span className="text-sm font-medium text-primary">
                                        {event.actual}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                                    {event.forecast || "-"}
                                  </td>
                                  <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                                    {event.previous || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-right mt-4">
                  <Button variant="link" className="text-primary">
                    Mostrar Todos os Eventos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
