import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Code,
  ArrowLeft,
  Key,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const API_EXAMPLES = {
  indicators: `// Listar todos os indicadores disponíveis
fetch('https://api.brasilmacrodata.com/v1/indicators')
  .then(res => res.json())
  .then(data => console.log(data));`,

  getData: `// Obter série histórica do IPCA (últimos 60 meses)
fetch('https://api.brasilmacrodata.com/v1/indicators/IPCA?periods=60', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`,

  focus: `// Obter expectativas do Boletim Focus
fetch('https://api.brasilmacrodata.com/v1/focus', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`,

  calculator: `// Calcular correção monetária
fetch('https://api.brasilmacrodata.com/v1/calculator/correct', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    indicatorCode: 'IPCA',
    value: 1000,
    startPeriod: '202301',
    endPeriod: '202312'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));`,

  python: `import requests

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://api.brasilmacrodata.com/v1'

# Obter dados do IPCA
response = requests.get(
    f'{BASE_URL}/indicators/IPCA',
    params={'periods': 60},
    headers={'Authorization': f'Bearer {API_KEY}'}
)

data = response.json()
print(data)`,

  curl: `# Listar indicadores
curl -X GET "https://api.brasilmacrodata.com/v1/indicators"

# Obter dados do IPCA
curl -X GET "https://api.brasilmacrodata.com/v1/indicators/IPCA?periods=60" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Calcular correção monetária
curl -X POST "https://api.brasilmacrodata.com/v1/calculator/correct" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"indicatorCode":"IPCA","value":1000,"startPeriod":"202301","endPeriod":"202312"}'`,
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/indicators",
    description: "Lista todos os indicadores disponíveis",
    auth: false,
  },
  {
    method: "GET",
    path: "/v1/indicators/:code",
    description: "Retorna série histórica de um indicador",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/indicators/summary",
    description: "Resumo dos principais indicadores",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/focus",
    description: "Expectativas do Boletim Focus",
    auth: true,
  },
  {
    method: "POST",
    path: "/v1/calculator/correct",
    description: "Calcula correção monetária",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/export/:code",
    description: "Exporta dados em CSV",
    auth: true,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para desenvolvedores e projetos pessoais",
    features: [
      "100 requisições/dia",
      "Indicadores básicos",
      "Dados com delay de 1 dia",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 99",
    period: "/mês",
    description: "Para empresas e aplicações comerciais",
    features: [
      "10.000 requisições/dia",
      "Todos os indicadores",
      "Dados em tempo real",
      "API de correção monetária",
      "Suporte prioritário",
      "Webhooks para alertas",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes volumes e necessidades específicas",
    features: [
      "Requisições ilimitadas",
      "SLA garantido",
      "Dados históricos completos",
      "API dedicada",
      "Suporte 24/7",
      "Integração personalizada",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
  },
];

export default function Api() {
  const { user, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState("javascript");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
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
              <div className="w-8 h-8 rounded-lg bg-chart-3 flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">API para Empresas</h1>
                <p className="text-xs text-muted-foreground">Documentação e Planos</p>
              </div>
            </div>
          </div>
          {isAuthenticated ? (
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Minhas Chaves
            </Button>
          ) : (
            <Button size="sm" asChild>
              <a href={getLoginUrl()}>Criar Conta</a>
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        {/* Hero */}
        <section className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            REST API
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            Integre Dados Macroeconômicos em Seus Sistemas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            API RESTful completa com dados atualizados do BCB, IBGE e Boletim Focus.
            Ideal para dashboards, relatórios automatizados e análises de mercado.
          </p>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Rápida</h3>
              <p className="text-sm text-muted-foreground">
                Latência média de 50ms
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Segura</h3>
              <p className="text-sm text-muted-foreground">
                HTTPS + autenticação JWT
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--chart-3)" }} />
              <h3 className="font-semibold mb-1">Atualizada</h3>
              <p className="text-sm text-muted-foreground">
                Dados em tempo real
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--chart-4)" }} />
              <h3 className="font-semibold mb-1">Confiável</h3>
              <p className="text-sm text-muted-foreground">
                99.9% de uptime
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-4">Endpoints Disponíveis</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {ENDPOINTS.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={endpoint.method === "GET" ? "default" : "secondary"}
                        className="font-mono text-xs"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </span>
                      {endpoint.auth && (
                        <Badge variant="outline" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          Auth
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-4">Exemplos de Código</h3>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <Card>
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="javascript" className="mt-0 space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{API_EXAMPLES.getData}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(API_EXAMPLES.getData)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python" className="mt-0 space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{API_EXAMPLES.python}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(API_EXAMPLES.python)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="curl" className="mt-0 space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{API_EXAMPLES.curl}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(API_EXAMPLES.curl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </section>

        {/* Pricing */}
        <section className="mb-12">
          <h3 className="text-xl font-bold mb-4 text-center">Planos e Preços</h3>
          <p className="text-center text-muted-foreground mb-8">
            Escolha o plano ideal para sua necessidade
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : ""}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => toast.info("Funcionalidade em breve!")}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
            <CardContent className="py-12">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Pronto para começar?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie sua conta gratuitamente e comece a integrar dados macroeconômicos
                em seus sistemas hoje mesmo.
              </p>
              <div className="flex items-center justify-center gap-4">
                {isAuthenticated ? (
                  <Button size="lg">
                    <Key className="h-4 w-4 mr-2" />
                    Gerar Chave API
                  </Button>
                ) : (
                  <Button size="lg" asChild>
                    <a href={getLoginUrl()}>Criar Conta Grátis</a>
                  </Button>
                )}
                <Button variant="outline" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Documentação
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
