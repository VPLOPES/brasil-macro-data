import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Table,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERIOD_OPTIONS = [
  { value: "12", label: "1 ano" },
  { value: "24", label: "2 anos" },
  { value: "60", label: "5 anos" },
  { value: "120", label: "10 anos" },
  { value: "240", label: "20 anos" },
];

export default function IndicatorDetail() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toUpperCase() || "IPCA";
  const [periods, setPeriods] = useState("60");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const { data: indicatorData, isLoading, refetch } = trpc.indicators.getData.useQuery(
    { code, periods: parseInt(periods) },
    { enabled: !!code }
  );

  const { data: summary } = trpc.indicators.getSummary.useQuery(
    { code },
    { enabled: !!code }
  );

  const { data: indicators } = trpc.indicators.list.useQuery();

  const indicatorConfig = useMemo(() => {
    return indicators?.find((i) => i.code === code);
  }, [indicators, code]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!indicatorData?.data || indicatorData.data.length === 0) return null;

    const values = indicatorData.data.map((d) => d.value);
    const sorted = [...values].sort((a, b) => a - b);

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];

    // Standard deviation
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Latest values
    const latest = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : null;
    const change = previous !== null ? latest - previous : null;

    return {
      mean,
      median,
      min,
      max,
      stdDev,
      latest,
      previous,
      change,
      count: values.length,
    };
  }, [indicatorData]);

  // Calculate year-over-year data
  const yoyData = useMemo(() => {
    if (!indicatorData?.data || indicatorData.data.length < 12) return [];

    const data = indicatorData.data;
    const result: Array<{ date: Date; value: number; periodCode: string }> = [];

    for (let i = 12; i < data.length; i++) {
      const current = data[i];
      const yearAgo = data[i - 12];

      // For rates like exchange, calculate % change
      // For indices like IPCA, calculate accumulated
      if (["USD_BRL", "EUR_BRL", "UNEMPLOYMENT", "IBC_BR"].includes(code)) {
        const yoyChange = ((current.value - yearAgo.value) / yearAgo.value) * 100;
        result.push({
          date: new Date(current.date),
          value: yoyChange,
          periodCode: current.periodCode,
        });
      } else {
        // For inflation indices, calculate 12-month accumulated
        const slice = data.slice(i - 11, i + 1);
        const accumulated = slice.reduce((acc, item) => acc * (1 + item.value / 100), 1);
        result.push({
          date: new Date(current.date),
          value: (accumulated - 1) * 100,
          periodCode: current.periodCode,
        });
      }
    }

    return result;
  }, [indicatorData, code]);

  const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  };

  const handleExport = () => {
    if (!indicatorData?.data) return;

    const header = `Data,${indicatorConfig?.name || code} (${indicatorConfig?.unit || ""})\n`;
    const rows = indicatorData.data
      .map((d) => {
        const dateStr = new Date(d.date).toISOString().split("T")[0];
        return `${dateStr},${d.value}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${code}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Arquivo exportado!");
  };

  const getChangeIcon = (val: number | null | undefined) => {
    if (val === null || val === undefined || Math.abs(val) < 0.01) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    return val > 0 ? (
      <TrendingUp className="h-4 w-4 text-destructive" />
    ) : (
      <TrendingDown className="h-4 w-4 text-success" />
    );
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
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{indicatorConfig?.name || code}</h1>
                <p className="text-xs text-muted-foreground">
                  {indicatorConfig?.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="stat-card">
            <span className="stat-label">Último Valor</span>
            <span className="stat-value text-primary">
              {formatValue(statistics?.latest)}
            </span>
            <span className="text-xs text-muted-foreground">
              {indicatorConfig?.unit}
            </span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Variação</span>
            <div className="flex items-center gap-2">
              {getChangeIcon(statistics?.change)}
              <span
                className={cn(
                  "stat-value",
                  statistics?.change && statistics.change > 0
                    ? "value-negative"
                    : "value-positive"
                )}
              >
                {statistics?.change && statistics.change > 0 ? "+" : ""}
                {formatValue(statistics?.change)}
              </span>
            </div>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Média</span>
            <span className="stat-value">{formatValue(statistics?.mean)}</span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Mediana</span>
            <span className="stat-value">{formatValue(statistics?.median)}</span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Mínimo</span>
            <span className="stat-value">{formatValue(statistics?.min)}</span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Máximo</span>
            <span className="stat-value">{formatValue(statistics?.max)}</span>
          </Card>
        </section>

        {/* Chart Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Select value={periods} onValueChange={setPeriods}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "chart" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("chart")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {statistics?.count} observações
          </p>
        </div>

        {/* Main Chart/Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Série Histórica</CardTitle>
            <CardDescription>
              Fonte: {indicatorConfig?.source.toUpperCase()} • Última atualização:{" "}
              {summary?.lastUpdate ? formatDate(summary.lastUpdate) : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : viewMode === "chart" ? (
              <TimeSeriesChart
                data={indicatorData?.data || []}
                name={indicatorConfig?.name || code}
                unit={indicatorConfig?.unit || "%"}
                color="var(--chart-1)"
                showArea
                showZeroLine={!["USD_BRL", "EUR_BRL"].includes(code)}
                height={400}
                dateFormat="month"
              />
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <table className="data-table">
                  <thead className="sticky top-0 bg-card">
                    <tr>
                      <th>Data</th>
                      <th className="text-right">Valor</th>
                      <th className="text-right">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorData?.data
                      .slice()
                      .reverse()
                      .map((item, index, arr) => {
                        const prev = arr[index + 1];
                        const change = prev ? item.value - prev.value : null;
                        return (
                          <tr key={item.periodCode}>
                            <td>{formatDate(item.date)}</td>
                            <td className="text-right tabular-nums">
                              {formatValue(item.value)} {indicatorConfig?.unit}
                            </td>
                            <td
                              className={cn(
                                "text-right tabular-nums",
                                change && change > 0 ? "value-negative" : "value-positive"
                              )}
                            >
                              {change !== null
                                ? `${change > 0 ? "+" : ""}${formatValue(change)}`
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year-over-Year Chart */}
        {yoyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {["USD_BRL", "EUR_BRL", "UNEMPLOYMENT", "IBC_BR"].includes(code)
                  ? "Variação em 12 Meses"
                  : "Acumulado em 12 Meses"}
              </CardTitle>
              <CardDescription>
                Comparação com o mesmo período do ano anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart
                data={yoyData}
                name={`${indicatorConfig?.name || code} YoY`}
                unit="%"
                color="var(--chart-2)"
                showArea
                showZeroLine
                height={300}
                dateFormat="month"
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
