import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  ArrowLeft,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const CONDITION_OPTIONS = [
  { value: "above", label: "Acima de" },
  { value: "below", label: "Abaixo de" },
  { value: "change_up", label: "Subir mais que" },
  { value: "change_down", label: "Cair mais que" },
];

interface AlertConfig {
  id: string;
  indicatorCode: string;
  indicatorName: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  lastTriggered?: Date;
}

// Mock alerts for demonstration
const MOCK_ALERTS: AlertConfig[] = [
  {
    id: "1",
    indicatorCode: "IPCA",
    indicatorName: "IPCA",
    condition: "above",
    threshold: 0.5,
    enabled: true,
    lastTriggered: new Date("2024-12-15"),
  },
  {
    id: "2",
    indicatorCode: "SELIC",
    indicatorName: "SELIC",
    condition: "change_down",
    threshold: 0.25,
    enabled: true,
  },
  {
    id: "3",
    indicatorCode: "USD_BRL",
    indicatorName: "Dólar",
    condition: "above",
    threshold: 6.0,
    enabled: false,
  },
];

export default function Alerts() {
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<AlertConfig[]>(MOCK_ALERTS);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    indicatorCode: "",
    condition: "above",
    threshold: "",
  });

  const { data: indicators } = trpc.indicators.list.useQuery();

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
    toast.success("Alerta atualizado!");
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    toast.success("Alerta removido!");
  };

  const handleCreateAlert = () => {
    if (!newAlert.indicatorCode || !newAlert.threshold) {
      toast.error("Preencha todos os campos");
      return;
    }

    const indicator = indicators?.find((i) => i.code === newAlert.indicatorCode);
    const newAlertConfig: AlertConfig = {
      id: Date.now().toString(),
      indicatorCode: newAlert.indicatorCode,
      indicatorName: indicator?.name || newAlert.indicatorCode,
      condition: newAlert.condition,
      threshold: parseFloat(newAlert.threshold),
      enabled: true,
    };

    setAlerts((prev) => [...prev, newAlertConfig]);
    setNewAlert({ indicatorCode: "", condition: "above", threshold: "" });
    setShowNewAlert(false);
    toast.success("Alerta criado com sucesso!");
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "above":
      case "change_up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "below":
      case "change_down":
        return <TrendingDown className="h-4 w-4 text-success" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConditionText = (condition: string, threshold: number, unit: string) => {
    switch (condition) {
      case "above":
        return `Valor acima de ${threshold}${unit}`;
      case "below":
        return `Valor abaixo de ${threshold}${unit}`;
      case "change_up":
        return `Variação positiva maior que ${threshold}${unit}`;
      case "change_down":
        return `Variação negativa maior que ${threshold}${unit}`;
      default:
        return "";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex items-center h-16">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-3 ml-6">
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <Bell className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Alertas</h1>
                <p className="text-xs text-muted-foreground">Notificações de indicadores</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Faça login para criar alertas</h2>
              <p className="text-muted-foreground mb-6">
                Receba notificações quando os indicadores atingirem os valores que
                você definir.
              </p>
              <Button asChild>
                <a href={getLoginUrl()}>Entrar na Plataforma</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
              <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
                <Bell className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Meus Alertas</h1>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter((a) => a.enabled).length} alertas ativos
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowNewAlert(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Alerta
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* New Alert Form */}
          {showNewAlert && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Criar Novo Alerta</CardTitle>
                <CardDescription>
                  Configure as condições para receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Indicador</Label>
                    <Select
                      value={newAlert.indicatorCode}
                      onValueChange={(v) =>
                        setNewAlert((prev) => ({ ...prev, indicatorCode: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {indicators?.map((indicator) => (
                          <SelectItem key={indicator.code} value={indicator.code}>
                            {indicator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condição</Label>
                    <Select
                      value={newAlert.condition}
                      onValueChange={(v) =>
                        setNewAlert((prev) => ({ ...prev, condition: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newAlert.threshold}
                      onChange={(e) =>
                        setNewAlert((prev) => ({ ...prev, threshold: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAlert}>Criar Alerta</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          {alerts.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum alerta configurado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie alertas para ser notificado quando os indicadores atingirem
                  valores específicos.
                </p>
                <Button onClick={() => setShowNewAlert(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Alerta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const indicator = indicators?.find(
                  (i) => i.code === alert.indicatorCode
                );
                return (
                  <Card
                    key={alert.id}
                    className={alert.enabled ? "" : "opacity-60"}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {getConditionIcon(alert.condition)}
                        </div>
                        <div>
                          <p className="font-semibold">{alert.indicatorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getConditionText(
                              alert.condition,
                              alert.threshold,
                              indicator?.unit || "%"
                            )}
                          </p>
                          {alert.lastTriggered && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3 text-success" />
                              Último disparo:{" "}
                              {new Date(alert.lastTriggered).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={() => handleToggleAlert(alert.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Como funcionam os alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Os alertas são verificados automaticamente quando novos dados são
                publicados pelas fontes oficiais (BCB e IBGE).
              </p>
              <p>
                Quando a condição configurada for atingida, você receberá uma
                notificação por email e também na plataforma.
              </p>
              <p>
                <strong>Dica:</strong> Configure alertas para variações significativas
                em vez de valores absolutos para evitar notificações frequentes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
