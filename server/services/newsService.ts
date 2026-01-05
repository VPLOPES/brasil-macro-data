import axios from "axios";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  category: "economia" | "mercado" | "politica" | "internacional";
  imageUrl?: string;
}

// Curated news sources for Brazilian economy
const NEWS_SOURCES = [
  {
    name: "InfoMoney",
    url: "https://www.infomoney.com.br",
    category: "economia" as const,
  },
  {
    name: "Valor Econômico",
    url: "https://valor.globo.com",
    category: "economia" as const,
  },
  {
    name: "Bloomberg Línea",
    url: "https://www.bloomberglinea.com.br",
    category: "mercado" as const,
  },
  {
    name: "CNN Brasil Economia",
    url: "https://www.cnnbrasil.com.br/economia",
    category: "economia" as const,
  },
  {
    name: "Agência Brasil",
    url: "https://agenciabrasil.ebc.com.br/economia",
    category: "economia" as const,
  },
];

// Simulated news data based on real economic topics
// In production, this would fetch from RSS feeds or news APIs
const SAMPLE_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Mercado financeiro projeta inflação de 4,06% para 2026",
    summary:
      "Boletim Focus divulgado pelo Banco Central mostra expectativa de inflação acima da meta para o próximo ano. Analistas apontam pressão dos preços de alimentos e serviços.",
    source: "Agência Brasil",
    sourceUrl: "https://agenciabrasil.ebc.com.br/economia",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    category: "economia",
  },
  {
    id: "2",
    title: "Taxa de desemprego atinge mínima histórica no Brasil",
    summary:
      "Desemprego caiu para 5,2% no trimestre encerrado em novembro, menor taxa da série histórica iniciada em 2012. Mercado de trabalho aquecido pressiona inflação de serviços.",
    source: "Bloomberg",
    sourceUrl: "https://www.bloomberglinea.com.br",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    category: "economia",
  },
  {
    id: "3",
    title: "Dólar fecha em alta e se aproxima de R$ 5,60",
    summary:
      "Moeda americana avança com incertezas fiscais domésticas e expectativa de juros mais altos nos EUA. Investidores monitoram cenário político em Washington.",
    source: "InfoMoney",
    sourceUrl: "https://www.infomoney.com.br",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    category: "mercado",
  },
  {
    id: "4",
    title: "COPOM deve elevar Selic para 15% na próxima reunião",
    summary:
      "Consenso do mercado aponta para nova alta de 1 ponto percentual na taxa básica de juros. BC sinaliza preocupação com desancoragem das expectativas de inflação.",
    source: "Valor Econômico",
    sourceUrl: "https://valor.globo.com",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    category: "economia",
  },
  {
    id: "5",
    title: "PIB brasileiro deve crescer 2,26% em 2025, projeta mercado",
    summary:
      "Expectativa de crescimento econômico se mantém estável segundo o Boletim Focus. Para 2026, projeção é de desaceleração para 1,80%.",
    source: "CNN Brasil",
    sourceUrl: "https://www.cnnbrasil.com.br/economia",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    category: "economia",
  },
  {
    id: "6",
    title: "Ibovespa renova máxima histórica e supera 148 mil pontos",
    summary:
      "Bolsa brasileira atinge novo recorde impulsionada por ações de commodities e bancos. Fluxo estrangeiro positivo contribui para alta.",
    source: "InfoMoney",
    sourceUrl: "https://www.infomoney.com.br",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    category: "mercado",
  },
  {
    id: "7",
    title: "Dívida pública brasileira supera desafio de emergentes",
    summary:
      "FMI aponta que dívida do Brasil, em 87,3% do PIB, está acima da média de 69,1% da América Latina. Trajetória fiscal preocupa investidores.",
    source: "Valor Internacional",
    sourceUrl: "https://valor.globo.com",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    category: "economia",
  },
  {
    id: "8",
    title: "Secretário de Reformas Econômicas deixa o governo",
    summary:
      "Marcos Pinto, figura-chave nas reformas tributária e administrativa, pediu demissão do cargo. Saída gera incertezas sobre agenda econômica.",
    source: "Investing.com",
    sourceUrl: "https://www.investing.com",
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    category: "politica",
  },
];

/**
 * Get latest economic news
 * In production, this would fetch from RSS feeds or news APIs
 */
export async function getLatestNews(limit: number = 6): Promise<NewsItem[]> {
  // Sort by date and return limited results
  const sortedNews = [...SAMPLE_NEWS].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  return sortedNews.slice(0, limit);
}

/**
 * Get news by category
 */
export async function getNewsByCategory(
  category: NewsItem["category"],
  limit: number = 5
): Promise<NewsItem[]> {
  const filteredNews = SAMPLE_NEWS.filter((news) => news.category === category);
  const sortedNews = filteredNews.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  return sortedNews.slice(0, limit);
}

/**
 * Get news sources
 */
export function getNewsSources() {
  return NEWS_SOURCES;
}

/**
 * Format relative time for news
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} min atrás`;
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`;
  } else if (diffDays === 1) {
    return "ontem";
  } else {
    return `${diffDays} dias atrás`;
  }
}
