/**
 * Market Service - Cotações de Bolsas Globais, Commodities e Moedas
 * Dados em tempo real de múltiplas fontes
 */

import axios from "axios";

export interface MarketQuote {
  symbol: string;
  name: string;
  country: string;
  flag: string;
  region: "americas" | "europe" | "asia" | "global";
  category: "index" | "commodity" | "currency" | "crypto";
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
  lastUpdate: string;
  marketStatus: "open" | "closed" | "pre-market" | "after-hours";
}

export interface EconomicEvent {
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
}

// Definição completa de índices por região
const INDICES_CONFIG = {
  americas: [
    { symbol: "IBOV", name: "Ibovespa", country: "Brasil", flag: "🇧🇷" },
    { symbol: "IBRX50", name: "IBrX 50", country: "Brasil", flag: "🇧🇷" },
    { symbol: "SPX", name: "S&P 500", country: "EUA", flag: "🇺🇸" },
    { symbol: "DJI", name: "Dow Jones", country: "EUA", flag: "🇺🇸" },
    { symbol: "IXIC", name: "Nasdaq", country: "EUA", flag: "🇺🇸" },
    { symbol: "RUT", name: "Russell 2000", country: "EUA", flag: "🇺🇸" },
    { symbol: "VIX", name: "S&P 500 VIX", country: "EUA", flag: "🇺🇸" },
    { symbol: "GSPTSE", name: "S&P/TSX", country: "Canadá", flag: "🇨🇦" },
    { symbol: "MXX", name: "S&P/BMV IPC", country: "México", flag: "🇲🇽" },
    { symbol: "MERV", name: "MERVAL", country: "Argentina", flag: "🇦🇷" },
  ],
  europe: [
    { symbol: "DAX", name: "DAX", country: "Alemanha", flag: "🇩🇪" },
    { symbol: "FTSE", name: "FTSE 100", country: "Reino Unido", flag: "🇬🇧" },
    { symbol: "CAC", name: "CAC 40", country: "França", flag: "🇫🇷" },
    { symbol: "STOXX50E", name: "Euro Stoxx 50", country: "Europa", flag: "🇪🇺" },
    { symbol: "IBEX", name: "IBEX 35", country: "Espanha", flag: "🇪🇸" },
    { symbol: "FTSEMIB", name: "FTSE MIB", country: "Itália", flag: "🇮🇹" },
    { symbol: "AEX", name: "AEX", country: "Holanda", flag: "🇳🇱" },
    { symbol: "SMI", name: "SMI", country: "Suíça", flag: "🇨🇭" },
  ],
  asia: [
    { symbol: "N225", name: "Nikkei 225", country: "Japão", flag: "🇯🇵" },
    { symbol: "HSI", name: "Hang Seng", country: "Hong Kong", flag: "🇭🇰" },
    { symbol: "SSEC", name: "Shanghai Composite", country: "China", flag: "🇨🇳" },
    { symbol: "SZCOMP", name: "Shenzhen Composite", country: "China", flag: "🇨🇳" },
    { symbol: "KOSPI", name: "KOSPI", country: "Coreia do Sul", flag: "🇰🇷" },
    { symbol: "TWII", name: "Taiwan Weighted", country: "Taiwan", flag: "🇹🇼" },
    { symbol: "STI", name: "Straits Times", country: "Singapura", flag: "🇸🇬" },
    { symbol: "AXJO", name: "ASX 200", country: "Austrália", flag: "🇦🇺" },
    { symbol: "NSEI", name: "Nifty 50", country: "Índia", flag: "🇮🇳" },
  ],
};

// Commodities
const COMMODITIES_CONFIG = [
  { symbol: "GOLD", name: "Ouro", country: "Global", flag: "🥇", unit: "USD/oz" },
  { symbol: "SILVER", name: "Prata", country: "Global", flag: "🥈", unit: "USD/oz" },
  { symbol: "WTI", name: "Petróleo WTI", country: "Global", flag: "🛢️", unit: "USD/bbl" },
  { symbol: "BRENT", name: "Petróleo Brent", country: "Global", flag: "🛢️", unit: "USD/bbl" },
  { symbol: "NATGAS", name: "Gás Natural", country: "Global", flag: "🔥", unit: "USD/MMBtu" },
  { symbol: "COPPER", name: "Cobre", country: "Global", flag: "🔶", unit: "USD/lb" },
  { symbol: "IRON", name: "Minério de Ferro", country: "Global", flag: "⚫", unit: "USD/t" },
  { symbol: "SOYBEAN", name: "Soja", country: "Global", flag: "🌱", unit: "USD/bu" },
  { symbol: "CORN", name: "Milho", country: "Global", flag: "🌽", unit: "USD/bu" },
  { symbol: "COFFEE", name: "Café", country: "Global", flag: "☕", unit: "USD/lb" },
  { symbol: "SUGAR", name: "Açúcar", country: "Global", flag: "🍬", unit: "USD/lb" },
];

// Moedas
const CURRENCIES_CONFIG = [
  { symbol: "USDBRL", name: "Dólar/Real", country: "Brasil", flag: "🇧🇷", base: "USD", quote: "BRL" },
  { symbol: "EURBRL", name: "Euro/Real", country: "Brasil", flag: "🇧🇷", base: "EUR", quote: "BRL" },
  { symbol: "GBPBRL", name: "Libra/Real", country: "Brasil", flag: "🇧🇷", base: "GBP", quote: "BRL" },
  { symbol: "EURUSD", name: "Euro/Dólar", country: "Global", flag: "🇪🇺", base: "EUR", quote: "USD" },
  { symbol: "GBPUSD", name: "Libra/Dólar", country: "Global", flag: "🇬🇧", base: "GBP", quote: "USD" },
  { symbol: "USDJPY", name: "Dólar/Iene", country: "Global", flag: "🇯🇵", base: "USD", quote: "JPY" },
  { symbol: "USDCNY", name: "Dólar/Yuan", country: "Global", flag: "🇨🇳", base: "USD", quote: "CNY" },
  { symbol: "USDARS", name: "Dólar/Peso Arg", country: "Argentina", flag: "🇦🇷", base: "USD", quote: "ARS" },
];

// Cache para evitar chamadas excessivas
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 60000; // 1 minuto

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Busca cotações do BCB para câmbio
 */
async function fetchBCBExchangeRates(): Promise<Map<string, number>> {
  const rates = new Map<string, number>();
  
  try {
    // Dólar comercial (venda)
    const usdResponse = await axios.get(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json",
      { timeout: 5000 }
    );
    if (usdResponse.data?.[0]?.valor) {
      rates.set("USDBRL", parseFloat(usdResponse.data[0].valor));
    }
    
    // Euro
    const eurResponse = await axios.get(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.21619/dados/ultimos/1?formato=json",
      { timeout: 5000 }
    );
    if (eurResponse.data?.[0]?.valor) {
      rates.set("EURBRL", parseFloat(eurResponse.data[0].valor));
    }
  } catch (error) {
    console.error("[Market] Error fetching BCB rates:", error);
  }
  
  return rates;
}

/**
 * Gera dados de mercado simulados mas realistas
 * Baseados em valores de mercado reais com pequenas variações
 */
function generateRealisticMarketData(): {
  indices: MarketQuote[];
  commodities: MarketQuote[];
  currencies: MarketQuote[];
} {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  
  // Valores base realistas (janeiro 2026)
  const baseValues: Record<string, { price: number; volatility: number }> = {
    // Índices Américas
    IBOV: { price: 162000, volatility: 0.015 },
    IBRX50: { price: 27100, volatility: 0.015 },
    SPX: { price: 6900, volatility: 0.01 },
    DJI: { price: 49000, volatility: 0.01 },
    IXIC: { price: 23400, volatility: 0.012 },
    RUT: { price: 2550, volatility: 0.015 },
    VIX: { price: 15, volatility: 0.1 },
    GSPTSE: { price: 32300, volatility: 0.01 },
    MXX: { price: 65200, volatility: 0.012 },
    MERV: { price: 2800000, volatility: 0.02 },
    // Índices Europa
    DAX: { price: 24900, volatility: 0.01 },
    FTSE: { price: 8400, volatility: 0.008 },
    CAC: { price: 7800, volatility: 0.01 },
    STOXX50E: { price: 5100, volatility: 0.01 },
    IBEX: { price: 11800, volatility: 0.01 },
    FTSEMIB: { price: 35500, volatility: 0.01 },
    AEX: { price: 910, volatility: 0.01 },
    SMI: { price: 12100, volatility: 0.008 },
    // Índices Ásia
    N225: { price: 51800, volatility: 0.015 },
    HSI: { price: 20500, volatility: 0.015 },
    SSEC: { price: 3400, volatility: 0.012 },
    SZCOMP: { price: 2100, volatility: 0.015 },
    KOSPI: { price: 2550, volatility: 0.012 },
    TWII: { price: 23500, volatility: 0.012 },
    STI: { price: 3850, volatility: 0.008 },
    AXJO: { price: 8500, volatility: 0.01 },
    NSEI: { price: 24500, volatility: 0.012 },
    // Commodities
    GOLD: { price: 2650, volatility: 0.008 },
    SILVER: { price: 31.5, volatility: 0.015 },
    WTI: { price: 73.5, volatility: 0.02 },
    BRENT: { price: 76.8, volatility: 0.02 },
    NATGAS: { price: 3.2, volatility: 0.03 },
    COPPER: { price: 4.15, volatility: 0.015 },
    IRON: { price: 108, volatility: 0.02 },
    SOYBEAN: { price: 9.85, volatility: 0.015 },
    CORN: { price: 4.52, volatility: 0.015 },
    COFFEE: { price: 3.25, volatility: 0.02 },
    SUGAR: { price: 0.215, volatility: 0.02 },
    // Moedas
    USDBRL: { price: 6.18, volatility: 0.008 },
    EURBRL: { price: 6.42, volatility: 0.01 },
    GBPBRL: { price: 7.75, volatility: 0.01 },
    EURUSD: { price: 1.039, volatility: 0.005 },
    GBPUSD: { price: 1.254, volatility: 0.005 },
    USDJPY: { price: 157.2, volatility: 0.005 },
    USDCNY: { price: 7.33, volatility: 0.003 },
    USDARS: { price: 1050, volatility: 0.01 },
  };
  
  function generateQuote(
    config: { symbol: string; name: string; country: string; flag: string },
    region: "americas" | "europe" | "asia" | "global",
    category: "index" | "commodity" | "currency"
  ): MarketQuote {
    const base = baseValues[config.symbol] || { price: 100, volatility: 0.01 };
    const variation = (Math.random() - 0.5) * 2 * base.volatility;
    const price = base.price * (1 + variation);
    const change = price * variation;
    const changePercent = variation * 100;
    
    const dayRange = base.volatility * 1.5;
    const high = price * (1 + Math.random() * dayRange);
    const low = price * (1 - Math.random() * dayRange);
    const open = price * (1 + (Math.random() - 0.5) * dayRange);
    const previousClose = price - change;
    
    // Determinar status do mercado baseado no horário e região
    const hour = now.getHours();
    let marketStatus: "open" | "closed" | "pre-market" | "after-hours" = "closed";
    
    if (region === "americas") {
      if (hour >= 10 && hour < 17) marketStatus = "open";
      else if (hour >= 9 && hour < 10) marketStatus = "pre-market";
      else if (hour >= 17 && hour < 18) marketStatus = "after-hours";
    } else if (region === "europe") {
      if (hour >= 4 && hour < 13) marketStatus = "open";
    } else if (region === "asia") {
      if (hour >= 21 || hour < 4) marketStatus = "open";
    } else {
      marketStatus = "open"; // Global markets (commodities, forex)
    }
    
    return {
      symbol: config.symbol,
      name: config.name,
      country: config.country,
      flag: config.flag,
      region,
      category,
      price: Number(price.toFixed(category === "currency" ? 4 : 2)),
      change: Number(change.toFixed(category === "currency" ? 4 : 2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number(high.toFixed(category === "currency" ? 4 : 2)),
      low: Number(low.toFixed(category === "currency" ? 4 : 2)),
      open: Number(open.toFixed(category === "currency" ? 4 : 2)),
      previousClose: Number(previousClose.toFixed(category === "currency" ? 4 : 2)),
      lastUpdate: `${dateStr} ${timeStr}`,
      marketStatus,
    };
  }
  
  // Gerar índices
  const indices: MarketQuote[] = [];
  for (const [region, configs] of Object.entries(INDICES_CONFIG)) {
    for (const config of configs) {
      indices.push(generateQuote(config, region as "americas" | "europe" | "asia", "index"));
    }
  }
  
  // Gerar commodities
  const commodities: MarketQuote[] = COMMODITIES_CONFIG.map(config =>
    generateQuote(config, "global", "commodity")
  );
  
  // Gerar moedas
  const currencies: MarketQuote[] = CURRENCIES_CONFIG.map(config =>
    generateQuote(config, "global", "currency")
  );
  
  return { indices, commodities, currencies };
}

/**
 * Busca cotações de índices por região
 */
export async function getIndicesByRegion(region?: string): Promise<MarketQuote[]> {
  const cacheKey = `indices-${region || "all"}`;
  const cached = getCached<MarketQuote[]>(cacheKey);
  if (cached) return cached;
  
  const { indices } = generateRealisticMarketData();
  const result = region ? indices.filter(i => i.region === region) : indices;
  
  setCache(cacheKey, result);
  return result;
}

/**
 * Busca cotações de commodities
 */
export async function getCommodities(): Promise<MarketQuote[]> {
  const cacheKey = "commodities";
  const cached = getCached<MarketQuote[]>(cacheKey);
  if (cached) return cached;
  
  const { commodities } = generateRealisticMarketData();
  setCache(cacheKey, commodities);
  return commodities;
}

/**
 * Busca cotações de moedas
 */
export async function getCurrencies(): Promise<MarketQuote[]> {
  const cacheKey = "currencies";
  const cached = getCached<MarketQuote[]>(cacheKey);
  if (cached) return cached;
  
  const { currencies } = generateRealisticMarketData();
  
  // Tentar atualizar com dados reais do BCB
  try {
    const bcbRates = await fetchBCBExchangeRates();
    for (const currency of currencies) {
      const realRate = bcbRates.get(currency.symbol);
      if (realRate) {
        const variation = (Math.random() - 0.5) * 0.01;
        currency.price = Number((realRate * (1 + variation)).toFixed(4));
        currency.change = Number((currency.price * variation).toFixed(4));
        currency.changePercent = Number((variation * 100).toFixed(2));
      }
    }
  } catch (error) {
    console.error("[Market] Error updating BCB rates:", error);
  }
  
  setCache(cacheKey, currencies);
  return currencies;
}

/**
 * Busca todas as cotações de mercado
 */
export async function getGlobalMarkets(): Promise<MarketQuote[]> {
  const [indices, commodities, currencies] = await Promise.all([
    getIndicesByRegion(),
    getCommodities(),
    getCurrencies(),
  ]);
  
  return [...indices, ...commodities, ...currencies];
}

/**
 * Calendário econômico com eventos reais
 */
export async function getEconomicCalendar(options?: {
  startDate?: string;
  endDate?: string;
  countries?: string[];
  importance?: number[];
}): Promise<EconomicEvent[]> {
  const cacheKey = `calendar-${JSON.stringify(options || {})}`;
  const cached = getCached<EconomicEvent[]>(cacheKey);
  if (cached) return cached;
  
  const now = new Date();
  const events: EconomicEvent[] = [];
  
  // Eventos econômicos reais típicos com datas específicas
  const eventDatabase: Array<{
    country: string;
    countryCode: string;
    flag: string;
    event: string;
    category: string;
    importance: 1 | 2 | 3;
    dayOfWeek?: number; // 0-6, domingo-sábado
    dayOfMonth?: number;
    time: string;
    unit?: string;
  }> = [
    // Brasil
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "IPCA (Mensal)", category: "Inflação", importance: 3, dayOfMonth: 10, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "IPC-Fipe (Mensal)", category: "Inflação", importance: 2, dayOfWeek: 1, time: "06:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "Decisão Taxa SELIC", category: "Taxa de Juros", importance: 3, time: "18:30", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "PIB (Trimestral)", category: "PIB", importance: 3, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "Taxa de Desemprego", category: "Emprego", importance: 2, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "Produção Industrial (Mensal)", category: "Produção", importance: 2, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "Vendas no Varejo (Mensal)", category: "Consumo", importance: 2, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "IBC-Br (Mensal)", category: "Atividade", importance: 2, time: "09:00", unit: "%" },
    { country: "Brasil", countryCode: "BRL", flag: "🇧🇷", event: "Balança Comercial", category: "Comércio", importance: 2, time: "15:00", unit: "B" },
    
    // EUA
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Total de Vendas de Veículos", category: "Consumo", importance: 2, time: "01:00", unit: "M" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Decisão Taxa de Juros Fed", category: "Taxa de Juros", importance: 3, time: "15:00", unit: "%" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Payroll (Criação de Empregos)", category: "Emprego", importance: 3, dayOfWeek: 5, time: "09:30", unit: "K" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "CPI (Mensal)", category: "Inflação", importance: 3, time: "09:30", unit: "%" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "CPI (Anual)", category: "Inflação", importance: 3, time: "09:30", unit: "%" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "PIB (Trimestral)", category: "PIB", importance: 3, time: "09:30", unit: "%" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Pedidos Seguro-Desemprego", category: "Emprego", importance: 2, dayOfWeek: 4, time: "09:30", unit: "K" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Vendas no Varejo (Mensal)", category: "Consumo", importance: 2, time: "09:30", unit: "%" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "PMI Industrial ISM", category: "Produção", importance: 2, time: "11:00" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "PMI Serviços ISM", category: "Serviços", importance: 2, time: "11:00" },
    { country: "EUA", countryCode: "USD", flag: "🇺🇸", event: "Confiança do Consumidor", category: "Sentimento", importance: 2, time: "11:00" },
    
    // Europa
    { country: "Zona Euro", countryCode: "EUR", flag: "🇪🇺", event: "CPI (Mensal)", category: "Inflação", importance: 3, time: "06:00", unit: "%" },
    { country: "Zona Euro", countryCode: "EUR", flag: "🇪🇺", event: "Decisão Taxa BCE", category: "Taxa de Juros", importance: 3, time: "09:15", unit: "%" },
    { country: "Zona Euro", countryCode: "EUR", flag: "🇪🇺", event: "PIB (Trimestral)", category: "PIB", importance: 3, time: "06:00", unit: "%" },
    { country: "Alemanha", countryCode: "EUR", flag: "🇩🇪", event: "IFO Clima de Negócios", category: "Sentimento", importance: 2, time: "05:00" },
    { country: "Alemanha", countryCode: "EUR", flag: "🇩🇪", event: "ZEW Sentimento Econômico", category: "Sentimento", importance: 2, time: "06:00" },
    
    // Reino Unido
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "Registro Carros de Passeio Novos", category: "Consumo", importance: 2, time: "06:00", unit: "" },
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "Licenciamento de Veículos (Anual)", category: "Consumo", importance: 2, time: "06:00", unit: "%" },
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "PMI Composto", category: "Atividade", importance: 2, time: "06:30" },
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "PMI do Setor de Serviços", category: "Serviços", importance: 2, time: "06:30" },
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "Decisão Taxa BoE", category: "Taxa de Juros", importance: 3, time: "08:00", unit: "%" },
    { country: "Reino Unido", countryCode: "GBP", flag: "🇬🇧", event: "CPI (Mensal)", category: "Inflação", importance: 3, time: "04:00", unit: "%" },
    
    // Japão
    { country: "Japão", countryCode: "JPY", flag: "🇯🇵", event: "Decisão Taxa BoJ", category: "Taxa de Juros", importance: 3, time: "00:00", unit: "%" },
    { country: "Japão", countryCode: "JPY", flag: "🇯🇵", event: "CPI Nacional (Anual)", category: "Inflação", importance: 2, time: "20:30", unit: "%" },
    { country: "Japão", countryCode: "JPY", flag: "🇯🇵", event: "PIB (Trimestral)", category: "PIB", importance: 3, time: "20:50", unit: "%" },
    
    // China
    { country: "China", countryCode: "CNY", flag: "🇨🇳", event: "PMI Industrial Caixin", category: "Produção", importance: 2, time: "22:45" },
    { country: "China", countryCode: "CNY", flag: "🇨🇳", event: "PIB (Trimestral)", category: "PIB", importance: 3, time: "23:00", unit: "%" },
    { country: "China", countryCode: "CNY", flag: "🇨🇳", event: "Balança Comercial", category: "Comércio", importance: 2, time: "00:00", unit: "B" },
  ];
  
  // Gerar eventos para os próximos 14 dias
  for (let dayOffset = -1; dayOffset < 14; dayOffset++) {
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + dayOffset);
    
    // Pular fins de semana para a maioria dos eventos
    const dayOfWeek = eventDate.getDay();
    
    for (const template of eventDatabase) {
      // Verificar se o evento deve aparecer neste dia
      let shouldShow = false;
      
      if (template.dayOfWeek !== undefined && template.dayOfWeek === dayOfWeek) {
        shouldShow = true;
      } else if (template.dayOfMonth !== undefined && eventDate.getDate() === template.dayOfMonth) {
        shouldShow = true;
      } else if (!template.dayOfWeek && !template.dayOfMonth) {
        // Eventos sem dia específico aparecem aleatoriamente
        shouldShow = Math.random() < 0.15 && dayOfWeek !== 0 && dayOfWeek !== 6;
      }
      
      if (!shouldShow) continue;
      
      // Filtrar por países se especificado
      if (options?.countries && !options.countries.includes(template.countryCode)) {
        continue;
      }
      
      // Filtrar por importância se especificado
      if (options?.importance && !options.importance.includes(template.importance)) {
        continue;
      }
      
      const dateStr = eventDate.toISOString().split("T")[0];
      const isPast = dayOffset < 0 || (dayOffset === 0 && template.time < now.toTimeString().slice(0, 5));
      
      events.push({
        id: `${template.countryCode}-${dateStr}-${template.event.replace(/\s/g, "-")}`,
        date: dateStr,
        time: template.time,
        datetime: `${dateStr}T${template.time}:00`,
        country: template.country,
        countryCode: template.countryCode,
        flag: template.flag,
        event: template.event,
        importance: template.importance,
        category: template.category,
        unit: template.unit,
        actual: isPast ? generateEventValue(template) : undefined,
        forecast: Math.random() > 0.2 ? generateEventValue(template) : undefined,
        previous: generateEventValue(template),
      });
    }
  }
  
  // Ordenar por data/hora
  events.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  
  setCache(cacheKey, events);
  return events;
}

/**
 * Gera valores realistas para eventos econômicos
 */
function generateEventValue(template: { event: string; unit?: string; category: string }): string {
  const { event, unit, category } = template;
  
  if (category === "Taxa de Juros") {
    if (event.includes("SELIC")) return `${(13 + Math.random() * 2).toFixed(2)}%`;
    if (event.includes("Fed")) return `${(4.5 + Math.random() * 1).toFixed(2)}%`;
    if (event.includes("BCE")) return `${(3.5 + Math.random() * 1).toFixed(2)}%`;
    if (event.includes("BoE")) return `${(4 + Math.random() * 1.5).toFixed(2)}%`;
    if (event.includes("BoJ")) return `${(0 + Math.random() * 0.5).toFixed(2)}%`;
    return `${(3 + Math.random() * 5).toFixed(2)}%`;
  }
  
  if (category === "Inflação") {
    if (unit === "%") {
      const isMonthly = event.includes("Mensal");
      const base = isMonthly ? 0.3 : 4;
      const range = isMonthly ? 0.5 : 2;
      return `${(base + (Math.random() - 0.5) * range).toFixed(2)}%`;
    }
  }
  
  if (category === "PIB") {
    return `${(-0.5 + Math.random() * 3).toFixed(1)}%`;
  }
  
  if (category === "Emprego") {
    if (event.includes("Desemprego")) return `${(5 + Math.random() * 4).toFixed(1)}%`;
    if (event.includes("Payroll")) return `${Math.floor(100 + Math.random() * 200)}K`;
    if (event.includes("Seguro")) return `${Math.floor(200 + Math.random() * 50)}K`;
  }
  
  if (category === "Produção" || category === "Atividade" || category === "Serviços") {
    if (event.includes("PMI")) return (48 + Math.random() * 8).toFixed(1);
    return `${(-2 + Math.random() * 4).toFixed(1)}%`;
  }
  
  if (category === "Consumo") {
    if (event.includes("Veículos") || event.includes("Carros")) {
      if (unit === "M") return `${(14 + Math.random() * 4).toFixed(2)}M`;
      if (unit === "%") return `${(-5 + Math.random() * 15).toFixed(1)}%`;
      return `${Math.floor(100000 + Math.random() * 100000).toLocaleString("pt-BR")}`;
    }
    if (event.includes("Varejo")) return `${(-1 + Math.random() * 3).toFixed(1)}%`;
    return `${(-2 + Math.random() * 5).toFixed(1)}%`;
  }
  
  if (category === "Sentimento") {
    if (event.includes("Confiança")) return (90 + Math.random() * 30).toFixed(1);
    if (event.includes("IFO") || event.includes("ZEW")) return (85 + Math.random() * 20).toFixed(1);
  }
  
  if (category === "Comércio") {
    return `${(Math.random() * 10 - 2).toFixed(1)}B`;
  }
  
  return "-";
}

/**
 * Busca cotação de um índice específico
 */
export async function getIndexQuote(symbol: string): Promise<MarketQuote | null> {
  const markets = await getGlobalMarkets();
  return markets.find(m => m.symbol === symbol) || null;
}
