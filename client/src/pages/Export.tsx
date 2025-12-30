import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  FileDown,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Table,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const PERIOD_OPTIONS = [
  { value: "12", label: "Últimos 12 meses" },
  { value: "24", label: "Últimos 24 meses" },
  { value: "60", label: "Últimos 5 anos" },
  { value: "120", label: "Últimos 10 anos" },
  { value: "240", label: "Últimos 20 anos" },
  { value: "360", label: "Últimos 30 anos" },
];

export default function Export() {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("IPCA");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("60");
  const [isExporting, setIsExporting] = useState(false);

  const { data: indicators } = trpc.indicators.list.useQuery();

  const exportQuery = trpc.export.csv.useQuery(
    { code: selectedIndicator, periods: parseInt(selectedPeriod) },
    { enabled: false }
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportQuery.refetch();
      if (result.data) {
        // Create and download file
        const blob = new Blob([result.data.content], { type: result.data.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Arquivo exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const getIndicatorInfo = (code: string) => {
    return indicators?.find((i) => i.code === code);
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
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileDown className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Exportar Dados</h1>
              <p className="text-xs text-muted-foreground">Baixe séries históricas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <section className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Exporte Dados para Análise</h2>
            <p className="text-muted-foreground">
              Baixe séries históricas completas dos indicadores econômicos brasileiros
              em formato CSV para usar em suas análises e relatórios.
            </p>
          </section>

          {/* Export Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Configurar Exportação</CardTitle>
              <CardDescription>
                Selecione o indicador e o período desejado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Indicator Selection */}
              <div className="space-y-2">
                <Label>Indicador</Label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o indicador" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators?.map((indicator) => (
                      <SelectItem key={indicator.code} value={indicator.code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{indicator.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {indicator.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Selection */}
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Info */}
              {selectedIndicator && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {getIndicatorInfo(selectedIndicator)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getIndicatorInfo(selectedIndicator)?.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fonte: {getIndicatorInfo(selectedIndicator)?.source.toUpperCase()} •
                        Unidade: {getIndicatorInfo(selectedIndicator)?.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting || !selectedIndicator}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Table className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Dados Estruturados</h3>
                  <p className="text-sm text-muted-foreground">
                    Formato CSV compatível com Excel, Google Sheets e ferramentas de análise
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-1">Fontes Oficiais</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados diretos do Banco Central e IBGE, sempre atualizados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center mb-3">
                    <FileDown className="h-6 w-6" style={{ color: "var(--chart-3)" }} />
                  </div>
                  <h3 className="font-semibold mb-1">Histórico Completo</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesso a séries históricas de até 30 anos de dados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API CTA */}
          <Card className="mt-8 border-primary/30">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold mb-1">Precisa de mais dados?</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa API oferece acesso programático a todos os indicadores para
                  integração em seus sistemas.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/api">Ver API</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
