import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Calculator as CalculatorIcon,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  RefreshCw,
  History,
  Info,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function Calculator() {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const [value, setValue] = useState<string>("1000");
  const [indicatorCode, setIndicatorCode] = useState<string>("IPCA");
  const [startMonth, setStartMonth] = useState<string>("01");
  const [startYear, setStartYear] = useState<string>(String(currentYear - 1));
  const [endMonth, setEndMonth] = useState<string>("12");
  const [endYear, setEndYear] = useState<string>(String(currentYear - 1));
  const [result, setResult] = useState<{
    originalValue: number;
    correctedValue: number;
    factor: number;
    percentChange: number;
    months: number;
    isReverse: boolean;
  } | null>(null);

  const { data: indices } = trpc.calculator.availableIndices.useQuery();

  const calculateMutation = trpc.calculator.correct.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao calcular correção");
    },
  });

  const handleCalculate = () => {
    const numValue = parseFloat(value.replace(/\./g, "").replace(",", "."));
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    const startPeriod = `${startYear}${startMonth}`;
    const endPeriod = `${endYear}${endMonth}`;

    calculateMutation.mutate({
      indicatorCode,
      value: numValue,
      startPeriod,
      endPeriod,
    });
  };

  const handleSwapDates = () => {
    const tempMonth = startMonth;
    const tempYear = startYear;
    setStartMonth(endMonth);
    setStartYear(endYear);
    setEndMonth(tempMonth);
    setEndYear(tempYear);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatPercent = (val: number) => {
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  };

  const getIndicatorDescription = (code: string) => {
    const descriptions: Record<string, string> = {
      IPCA: "Índice oficial de inflação do Brasil, usado para reajustes de contratos e salários.",
      INPC: "Mede a variação de preços para famílias com renda de 1 a 5 salários mínimos.",
      IGP_M: "Índice amplo usado principalmente para reajuste de aluguéis.",
      SELIC: "Taxa básica de juros da economia, referência para investimentos em renda fixa.",
      CDI: "Taxa de referência para investimentos, muito próxima da SELIC.",
    };
    return descriptions[code] || "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-3 ml-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CalculatorIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Calculadora de Correção Monetária</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <Card>
            <CardHeader>
              <CardTitle>Calcular Correção</CardTitle>
              <CardDescription>
                Corrija valores monetários usando índices oficiais brasileiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Value Input */}
              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="1.000,00"
                  className="text-lg font-semibold"
                />
              </div>

              {/* Index Selection */}
              <div className="space-y-2">
                <Label>Índice de Correção</Label>
                <Select value={indicatorCode} onValueChange={setIndicatorCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o índice" />
                  </SelectTrigger>
                  <SelectContent>
                    {indices?.map((index) => (
                      <SelectItem key={index.code} value={index.code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{index.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {index.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {getIndicatorDescription(indicatorCode)}
                </p>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Período</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwapDates}
                    className="text-xs"
                  >
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    Inverter
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                    <div className="flex gap-2">
                      <Select value={startMonth} onValueChange={setStartMonth}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={startYear} onValueChange={setStartYear}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data Final</Label>
                    <div className="flex gap-2">
                      <Select value={endMonth} onValueChange={setEndMonth}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={endYear} onValueChange={setEndYear}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                className="w-full"
                size="lg"
              >
                {calculateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Calcular
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <div className="space-y-6">
            {result ? (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Resultado da {result.isReverse ? "Descapitalização" : "Correção"}
                  </CardTitle>
                  <CardDescription>
                    {indices?.find((i) => i.code === indicatorCode)?.name} -{" "}
                    {result.months} {result.months === 1 ? "mês" : "meses"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <span className="stat-label">Valor Original</span>
                      <span className="stat-value text-muted-foreground">
                        {formatCurrency(result.originalValue)}
                      </span>
                    </div>
                    <div className="stat-card bg-primary/5 border-primary/20">
                      <span className="stat-label">Valor Corrigido</span>
                      <span className="stat-value text-primary">
                        {formatCurrency(result.correctedValue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <span className="stat-label">Variação Total</span>
                      <span
                        className={`stat-value ${
                          result.percentChange >= 0 ? "value-positive" : "value-negative"
                        }`}
                      >
                        {result.percentChange >= 0 ? "+" : ""}
                        {formatPercent(result.percentChange)}
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Fator de Correção</span>
                      <span className="stat-value tabular-nums">
                        {result.factor.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {result.isReverse ? (
                        <>
                          Para obter <strong>{formatCurrency(result.originalValue)}</strong> em{" "}
                          {MONTHS.find((m) => m.value === endMonth)?.label}/{endYear}, era
                          necessário ter{" "}
                          <strong className="text-primary">
                            {formatCurrency(result.correctedValue)}
                          </strong>{" "}
                          em {MONTHS.find((m) => m.value === startMonth)?.label}/{startYear}.
                        </>
                      ) : (
                        <>
                          O valor de <strong>{formatCurrency(result.originalValue)}</strong> em{" "}
                          {MONTHS.find((m) => m.value === startMonth)?.label}/{startYear}{" "}
                          equivale a{" "}
                          <strong className="text-primary">
                            {formatCurrency(result.correctedValue)}
                          </strong>{" "}
                          em {MONTHS.find((m) => m.value === endMonth)?.label}/{endYear}.
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalculatorIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    Calcule a correção monetária
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Preencha os campos ao lado para calcular a correção de valores
                    usando índices oficiais brasileiros.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Sobre os Índices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>IPCA</strong> - Índice oficial de inflação, calculado pelo
                  IBGE. Usado para reajustes de contratos, salários e metas de
                  inflação.
                </div>
                <div>
                  <strong>INPC</strong> - Mede a variação de preços para famílias com
                  renda de 1 a 5 salários mínimos. Usado para reajuste do salário
                  mínimo.
                </div>
                <div>
                  <strong>IGP-M</strong> - Índice amplo calculado pela FGV. Muito
                  usado para reajuste de aluguéis e contratos de energia.
                </div>
                <div>
                  <strong>SELIC</strong> - Taxa básica de juros definida pelo Banco
                  Central. Referência para investimentos em renda fixa.
                </div>
                <div>
                  <strong>CDI</strong> - Taxa de referência para operações
                  interbancárias. Base para rentabilidade de CDBs e fundos DI.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
