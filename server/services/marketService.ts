/**
 * Market Service - Cotações de Bolsas Globais
 * Integração com Yahoo Finance API para dados em tempo real
 */

import { callDataApi } from "../_core/dataApi";

export interface StockQuote {
  symbol: string;
  name: string;
  country: string;
  flag: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdate: Date;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  flag: string;
  event: string;
  importance: 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high
  actual?: string;
  forecast?: string;
  previous?: string;
}

// Símbolos das principais bolsas mundiais
const MARKET_SYMBOLS = [
  { symbol: "^BVSP", name: "Ibovespa", country: "Brasil", flag: "🇧🇷" },
  { symbol: "^GSPC", name: "S&P 500", country: "EUA", flag: "🇺🇸" },
  { symbol: "^DJI", name: "Dow Jones", country: "EUA", flag: "🇺🇸" },
  { symbol: "^IXIC", name: "Nasdaq", country: "EUA", flag: "🇺🇸" },
  { symbol: "^RUT", name: "Russell 2000", country: "EUA", flag: "🇺🇸" },
  { symbol: "^VIX", name: "S&P 500 VIX", country: "EUA", flag: "🇺🇸" },
  { symbol: "^GSPTSE", name: "S&P/TSX", country: "Canadá", flag: "🇨🇦" },
  { symbol: "^MXX", name: "S&P/BMV IPC", country: "México", flag: "🇲🇽" },
  { symbol: "^GDAXI", name: "DAX", country: "Alemanha", flag: "🇩🇪" },
  { symbol: "^FTSE", name: "FTSE 100", country: "Reino Unido", flag: "🇬🇧" },
  { symbol: "^FCHI", name: "CAC 40", country: "França", flag: "🇫🇷" },
  { symbol: "^N225", name: "Nikkei 225", country: "Japão", flag: "🇯🇵" },
  { symbol: "^HSI", name: "Hang Seng", country: "Hong Kong", flag: "🇭🇰" },
  { symbol: "000001.SS", name: "Shanghai", country: "China", flag: "🇨🇳" },
];

// Símbolos de commodities e moedas
const COMMODITY_SYMBOLS = [
  { symbol: "GC=F", name: "Ouro", country: "Global", flag: "🥇" },
  { symbol: "SI=F", name: "Prata", country: "Global", flag: "🥈" },
  { symbol: "CL=F", name: "Petróleo WTI", country: "Global", flag: "🛢️" },
  { symbol: "BZ=F", name: "Petróleo Brent", country: "Global", flag: "🛢️" },
  { symbol: "BRL=X", name: "USD/BRL", country: "Brasil", flag: "🇧🇷" },
  { symbol: "EURUSD=X", name: "EUR/USD", country: "Global", flag: "🇪🇺" },
];

/**
 * Busca cotação de um símbolo específico
 */
async function fetchStockQuote(symbolInfo: typeof MARKET_SYMBOLS[0]): Promise<StockQuote | null> {
  try {
    console.log(`[Market] Fetching quote for ${symbolInfo.symbol}...`);
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbolInfo.symbol,
        region: "US",
        interval: "1d",
        range: "1d",
        includeAdjustedClose: "true",
      },
    }) as { chart?: { result?: Array<{ meta: Record<string, number>; indicators?: { quote?: Array<{ high?: number[]; low?: number[] }> } }> } };
    console.log(`[Market] Response for ${symbolInfo.symbol}:`, JSON.stringify(response).substring(0, 200));

    if (response?.chart?.result?.[0]) {
      const result = response.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      const price = meta.regularMarketPrice || 0;
      const previousClose = meta.previousClose || meta.chartPreviousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbolInfo.symbol,
        name: symbolInfo.name,
        country: symbolInfo.country,
        flag: symbolInfo.flag,
        price: price,
        change: change,
        changePercent: changePercent,
        high: meta.regularMarketDayHigh || quote?.high?.[0] || price,
        low: meta.regularMarketDayLow || quote?.low?.[0] || price,
        volume: meta.regularMarketVolume || 0,
        lastUpdate: new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error(`[Market] Error fetching ${symbolInfo.symbol}:`, error);
    return null;
  }
}

/**
 * Busca cotações de todas as bolsas principais
 */
export async function getGlobalMarkets(): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];
  
  // Buscar em paralelo com limite de concorrência
  const batchSize = 5;
  for (let i = 0; i < MARKET_SYMBOLS.length; i += batchSize) {
    const batch = MARKET_SYMBOLS.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchStockQuote));
    quotes.push(...results.filter((q): q is StockQuote => q !== null));
  }
  
  return quotes;
}

/**
 * Busca cotações de commodities e moedas
 */
export async function getCommodities(): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];
  
  const results = await Promise.all(COMMODITY_SYMBOLS.map(fetchStockQuote));
  quotes.push(...results.filter((q): q is StockQuote => q !== null));
  
  return quotes;
}

/**
 * Calendário econômico com eventos importantes
 * Dados simulados baseados em eventos reais típicos
 */
export async function getEconomicCalendar(): Promise<EconomicEvent[]> {
  // Gerar eventos baseados na data atual
  const now = new Date();
  const events: EconomicEvent[] = [];
  
  // Eventos típicos que afetam o mercado brasileiro
  const eventTemplates = [
    // Eventos dos EUA
    { currency: "USD", flag: "🇺🇸", event: "Decisão de Taxa de Juros do Fed", importance: 3 as const },
    { currency: "USD", flag: "🇺🇸", event: "Payroll - Criação de Empregos", importance: 3 as const },
    { currency: "USD", flag: "🇺🇸", event: "CPI - Índice de Preços ao Consumidor", importance: 3 as const },
    { currency: "USD", flag: "🇺🇸", event: "PIB Trimestral (Preliminar)", importance: 3 as const },
    { currency: "USD", flag: "🇺🇸", event: "Pedidos de Seguro-Desemprego", importance: 2 as const },
    { currency: "USD", flag: "🇺🇸", event: "Vendas no Varejo", importance: 2 as const },
    { currency: "USD", flag: "🇺🇸", event: "PMI Industrial ISM", importance: 2 as const },
    { currency: "USD", flag: "🇺🇸", event: "Confiança do Consumidor", importance: 2 as const },
    
    // Eventos da Europa
    { currency: "EUR", flag: "🇪🇺", event: "Decisão de Taxa de Juros do BCE", importance: 3 as const },
    { currency: "EUR", flag: "🇪🇺", event: "CPI da Zona do Euro", importance: 2 as const },
    { currency: "GBP", flag: "🇬🇧", event: "Decisão de Taxa de Juros do BoE", importance: 3 as const },
    
    // Eventos do Brasil
    { currency: "BRL", flag: "🇧🇷", event: "Decisão de Taxa SELIC - COPOM", importance: 3 as const },
    { currency: "BRL", flag: "🇧🇷", event: "IPCA Mensal", importance: 3 as const },
    { currency: "BRL", flag: "🇧🇷", event: "PIB Trimestral", importance: 3 as const },
    { currency: "BRL", flag: "🇧🇷", event: "Taxa de Desemprego PNAD", importance: 2 as const },
    { currency: "BRL", flag: "🇧🇷", event: "Produção Industrial", importance: 2 as const },
    { currency: "BRL", flag: "🇧🇷", event: "Vendas no Varejo", importance: 2 as const },
    { currency: "BRL", flag: "🇧🇷", event: "IBC-Br - Atividade Econômica", importance: 2 as const },
    
    // Eventos da Ásia
    { currency: "JPY", flag: "🇯🇵", event: "Decisão de Taxa de Juros do BoJ", importance: 2 as const },
    { currency: "CNY", flag: "🇨🇳", event: "PMI Industrial da China", importance: 2 as const },
    { currency: "CNY", flag: "🇨🇳", event: "PIB Trimestral da China", importance: 3 as const },
  ];
  
  // Gerar eventos para os próximos 7 dias
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    
    // Pular fins de semana
    if (eventDate.getDay() === 0 || eventDate.getDay() === 6) continue;
    
    // Selecionar 3-5 eventos aleatórios por dia
    const numEvents = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...eventTemplates].sort(() => Math.random() - 0.5);
    const selectedEvents = shuffled.slice(0, numEvents);
    
    for (const template of selectedEvents) {
      const hour = 8 + Math.floor(Math.random() * 10); // Entre 8h e 18h
      const minute = Math.random() > 0.5 ? 0 : 30;
      eventDate.setHours(hour, minute, 0, 0);
      
      // Gerar valores para eventos passados
      const isPast = eventDate < now;
      const hasForecast = Math.random() > 0.3;
      
      events.push({
        id: `${template.currency}-${dayOffset}-${events.length}`,
        time: eventDate.toISOString(),
        currency: template.currency,
        flag: template.flag,
        event: template.event,
        importance: template.importance,
        actual: isPast ? generateValue(template.event) : undefined,
        forecast: hasForecast ? generateValue(template.event) : undefined,
        previous: generateValue(template.event),
      });
    }
  }
  
  // Ordenar por data/hora
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  return events;
}

/**
 * Gera valores simulados para eventos econômicos
 */
function generateValue(eventName: string): string {
  if (eventName.includes("Taxa") || eventName.includes("SELIC")) {
    const rate = 4 + Math.random() * 10;
    return `${rate.toFixed(2)}%`;
  }
  if (eventName.includes("CPI") || eventName.includes("IPCA") || eventName.includes("Inflação")) {
    const rate = -0.5 + Math.random() * 1.5;
    return `${rate.toFixed(2)}%`;
  }
  if (eventName.includes("PIB")) {
    const rate = -1 + Math.random() * 4;
    return `${rate.toFixed(1)}%`;
  }
  if (eventName.includes("Desemprego")) {
    const rate = 4 + Math.random() * 8;
    return `${rate.toFixed(1)}%`;
  }
  if (eventName.includes("PMI")) {
    const value = 45 + Math.random() * 15;
    return value.toFixed(1);
  }
  if (eventName.includes("Payroll") || eventName.includes("Emprego")) {
    const value = Math.floor(-50 + Math.random() * 400);
    return `${value}K`;
  }
  if (eventName.includes("Confiança")) {
    const value = 80 + Math.random() * 40;
    return value.toFixed(1);
  }
  if (eventName.includes("Vendas")) {
    const rate = -2 + Math.random() * 5;
    return `${rate.toFixed(1)}%`;
  }
  if (eventName.includes("Produção")) {
    const rate = -3 + Math.random() * 6;
    return `${rate.toFixed(1)}%`;
  }
  return "-";
}

/**
 * Busca cotação de um índice específico
 */
export async function getIndexQuote(symbol: string): Promise<StockQuote | null> {
  const symbolInfo = [...MARKET_SYMBOLS, ...COMMODITY_SYMBOLS].find(s => s.symbol === symbol);
  if (!symbolInfo) return null;
  return fetchStockQuote(symbolInfo);
}
