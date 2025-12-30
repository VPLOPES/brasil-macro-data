/**
 * Unified Indicator Service
 * Aggregates data from BCB and IBGE sources
 */

import {
  getBCBIndicator,
  getLatestBCBValue,
  BCB_SERIES,
  fetchFocusExpectations,
  calculateAccumulated,
  calculateYTD,
} from "./bcbService";
import {
  getIPCA,
  getINPC,
  getUnemployment,
  getIndustrialProduction,
  getRetailSales,
} from "./ibgeService";

export interface IndicatorSummary {
  code: string;
  name: string;
  description: string;
  currentValue: number | null;
  previousValue: number | null;
  change: number | null;
  accumulated12m: number | null;
  accumulatedYTD: number | null;
  lastUpdate: Date | null;
  unit: string;
  source: string;
  category: string;
}

export interface IndicatorTimeSeries {
  code: string;
  name: string;
  data: Array<{
    date: Date;
    value: number;
    periodCode: string;
  }>;
}

export interface FocusSummary {
  indicator: string;
  currentYear: number;
  nextYear: number;
  projections: {
    year: number;
    median: number;
    mean: number;
    min: number;
    max: number;
  }[];
}

// Indicator configurations
export const INDICATORS_CONFIG = {
  // Inflation
  IPCA: {
    code: "IPCA",
    name: "IPCA",
    description: "Índice de Preços ao Consumidor Amplo",
    unit: "%",
    source: "ibge",
    category: "inflation",
  },
  INPC: {
    code: "INPC",
    name: "INPC",
    description: "Índice Nacional de Preços ao Consumidor",
    unit: "%",
    source: "ibge",
    category: "inflation",
  },
  IGP_M: {
    code: "IGP_M",
    name: "IGP-M",
    description: "Índice Geral de Preços - Mercado",
    unit: "%",
    source: "bcb",
    category: "inflation",
  },

  // Interest rates
  SELIC: {
    code: "SELIC",
    name: "SELIC",
    description: "Taxa básica de juros",
    unit: "% a.a.",
    source: "bcb",
    category: "interest",
  },
  CDI: {
    code: "CDI",
    name: "CDI",
    description: "Certificado de Depósito Interbancário",
    unit: "% a.a.",
    source: "bcb",
    category: "interest",
  },

  // Exchange rates
  USD_BRL: {
    code: "USD_BRL",
    name: "Dólar",
    description: "Cotação do dólar comercial",
    unit: "R$",
    source: "bcb",
    category: "exchange",
  },
  EUR_BRL: {
    code: "EUR_BRL",
    name: "Euro",
    description: "Cotação do euro",
    unit: "R$",
    source: "bcb",
    category: "exchange",
  },

  // Economic activity
  IBC_BR: {
    code: "IBC_BR",
    name: "IBC-Br",
    description: "Índice de Atividade Econômica do BC",
    unit: "índice",
    source: "bcb",
    category: "activity",
  },
  INDUSTRIAL: {
    code: "INDUSTRIAL",
    name: "Produção Industrial",
    description: "Variação da produção industrial",
    unit: "%",
    source: "ibge",
    category: "activity",
  },
  RETAIL: {
    code: "RETAIL",
    name: "Vendas Varejo",
    description: "Variação das vendas do varejo",
    unit: "%",
    source: "ibge",
    category: "activity",
  },

  // Employment
  UNEMPLOYMENT: {
    code: "UNEMPLOYMENT",
    name: "Desemprego",
    description: "Taxa de desocupação",
    unit: "%",
    source: "ibge",
    category: "employment",
  },

  // Fiscal
  DEBT_GDP: {
    code: "DEBT_GDP",
    name: "Dívida/PIB",
    description: "Dívida líquida do setor público",
    unit: "% PIB",
    source: "bcb",
    category: "fiscal",
  },
  PRIMARY_RESULT: {
    code: "PRIMARY_RESULT",
    name: "Resultado Primário",
    description: "Resultado primário do setor público",
    unit: "% PIB",
    source: "bcb",
    category: "fiscal",
  },

  // External sector
  TRADE_BALANCE: {
    code: "TRADE_BALANCE",
    name: "Balança Comercial",
    description: "Saldo da balança comercial",
    unit: "US$ Mi",
    source: "bcb",
    category: "external",
  },
  CURRENT_ACCOUNT: {
    code: "CURRENT_ACCOUNT",
    name: "Trans. Correntes",
    description: "Saldo em transações correntes",
    unit: "US$ Mi",
    source: "bcb",
    category: "external",
  },
} as const;

/**
 * Get indicator time series data
 */
export async function getIndicatorData(
  code: string,
  periods: number = 120
): Promise<IndicatorTimeSeries | null> {
  const config = INDICATORS_CONFIG[code as keyof typeof INDICATORS_CONFIG];
  if (!config) return null;

  let data: Array<{ date: Date; value: number; periodCode: string }> = [];

  try {
    switch (code) {
      case "IPCA":
        data = (await getIPCA(periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "INPC":
        data = (await getINPC(periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "IGP_M":
        data = (await getBCBIndicator(BCB_SERIES.IGP_M, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "SELIC":
        data = (await getBCBIndicator(BCB_SERIES.SELIC_MONTHLY, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "CDI":
        data = (await getBCBIndicator(BCB_SERIES.CDI_MONTHLY, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "USD_BRL":
        data = (await getBCBIndicator(BCB_SERIES.USD_BRL_SELL, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "EUR_BRL":
        data = (await getBCBIndicator(BCB_SERIES.EUR_BRL, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "IBC_BR":
        data = (await getBCBIndicator(BCB_SERIES.IBC_BR, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "INDUSTRIAL":
        data = (await getIndustrialProduction(periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "RETAIL":
        data = (await getRetailSales(periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "UNEMPLOYMENT":
        data = (await getUnemployment(periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "DEBT_GDP":
        data = (await getBCBIndicator(BCB_SERIES.DEBT_GDP, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "PRIMARY_RESULT":
        data = (await getBCBIndicator(BCB_SERIES.PRIMARY_RESULT, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "TRADE_BALANCE":
        data = (await getBCBIndicator(BCB_SERIES.TRADE_BALANCE, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      case "CURRENT_ACCOUNT":
        data = (await getBCBIndicator(BCB_SERIES.CURRENT_ACCOUNT, periods)).map((d) => ({
          date: d.date,
          value: d.value,
          periodCode: d.periodCode,
        }));
        break;
      default:
        return null;
    }

    // Sort by date ascending
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      code: config.code,
      name: config.name,
      data,
    };
  } catch (error) {
    console.error(`[IndicatorService] Error fetching ${code}:`, error);
    return null;
  }
}

/**
 * Get indicator summary with current value and changes
 */
export async function getIndicatorSummary(
  code: string
): Promise<IndicatorSummary | null> {
  const config = INDICATORS_CONFIG[code as keyof typeof INDICATORS_CONFIG];
  if (!config) return null;

  const timeSeries = await getIndicatorData(code, 24);
  if (!timeSeries || timeSeries.data.length === 0) {
    return {
      ...config,
      currentValue: null,
      previousValue: null,
      change: null,
      accumulated12m: null,
      accumulatedYTD: null,
      lastUpdate: null,
    };
  }

  const data = timeSeries.data;
  const current = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;

  // Calculate accumulated values for inflation/interest indicators
  let accumulated12m: number | null = null;
  let accumulatedYTD: number | null = null;

  if (["IPCA", "INPC", "IGP_M", "SELIC", "CDI"].includes(code)) {
    const fullData = await getIndicatorData(code, 120);
    if (fullData && fullData.data.length >= 12) {
      const processedData = fullData.data.map((d) => ({
        date: d.date,
        value: d.value,
        periodCode: d.periodCode,
        year: d.date.getFullYear(),
        month: d.date.getMonth() + 1,
      }));

      // Calculate 12-month accumulated
      if (processedData.length >= 12) {
        const last12 = processedData.slice(-12);
        const factor12 = last12.reduce((acc, item) => acc * (1 + item.value / 100), 1);
        accumulated12m = (factor12 - 1) * 100;
      }
      
      // Calculate YTD accumulated
      const currentYear = new Date().getFullYear();
      const ytdData = processedData.filter((item) => item.year === currentYear);
      if (ytdData.length > 0) {
        const factorYTD = ytdData.reduce((acc, item) => acc * (1 + item.value / 100), 1);
        accumulatedYTD = (factorYTD - 1) * 100;
      }
    }
  }

  return {
    ...config,
    currentValue: current.value,
    previousValue: previous?.value ?? null,
    change: previous ? current.value - previous.value : null,
    accumulated12m,
    accumulatedYTD,
    lastUpdate: current.date,
  };
}

/**
 * Get all main indicators summary
 */
export async function getAllIndicatorsSummary(): Promise<IndicatorSummary[]> {
  const mainIndicators = [
    "IPCA",
    "SELIC",
    "CDI",
    "USD_BRL",
    "UNEMPLOYMENT",
    "IBC_BR",
    "IGP_M",
    "DEBT_GDP",
  ];

  const summaries = await Promise.all(
    mainIndicators.map((code) => getIndicatorSummary(code))
  );

  return summaries.filter((s): s is IndicatorSummary => s !== null);
}

/**
 * Get Focus market expectations summary
 */
export async function getFocusSummary(): Promise<FocusSummary[]> {
  const focusIndicators = ["IPCA", "PIB Total", "Selic", "Câmbio", "IGP-M"];
  const currentYear = new Date().getFullYear();

  const results: FocusSummary[] = [];

  for (const indicator of focusIndicators) {
    try {
      const data = await fetchFocusExpectations(indicator);
      if (data.length === 0) continue;

      // Get latest projections for each year
      const yearProjections = new Map<
        number,
        { median: number; mean: number; min: number; max: number }
      >();

      for (const item of data) {
        const year = parseInt(item.DataReferencia);
        if (year >= currentYear && year <= currentYear + 3) {
          if (!yearProjections.has(year)) {
            yearProjections.set(year, {
              median: item.Mediana,
              mean: item.Media,
              min: item.Minimo,
              max: item.Maximo,
            });
          }
        }
      }

      const projections = Array.from(yearProjections.entries())
        .map(([year, values]) => ({ year, ...values }))
        .sort((a, b) => a.year - b.year);

      if (projections.length > 0) {
        results.push({
          indicator,
          currentYear,
          nextYear: currentYear + 1,
          projections,
        });
      }
    } catch (error) {
      console.error(`[Focus] Error fetching ${indicator}:`, error);
    }
  }

  return results;
}

/**
 * Calculate monetary correction between two periods
 */
export async function calculateMonetaryCorrection(
  indicatorCode: string,
  value: number,
  startPeriod: string,
  endPeriod: string
): Promise<{
  originalValue: number;
  correctedValue: number;
  factor: number;
  percentChange: number;
  months: number;
  isReverse: boolean;
} | null> {
  const timeSeries = await getIndicatorData(indicatorCode, 360);
  if (!timeSeries || timeSeries.data.length === 0) return null;

  const isReverse = startPeriod > endPeriod;
  const periodStart = isReverse ? endPeriod : startPeriod;
  const periodEnd = isReverse ? startPeriod : endPeriod;

  const filteredData = timeSeries.data.filter(
    (d) => d.periodCode >= periodStart && d.periodCode <= periodEnd
  );

  if (filteredData.length === 0) return null;

  // Calculate compound factor
  const factor = filteredData.reduce((acc, item) => acc * (1 + item.value / 100), 1);

  const correctedValue = isReverse ? value / factor : value * factor;
  const percentChange = (factor - 1) * 100;

  return {
    originalValue: value,
    correctedValue,
    factor,
    percentChange,
    months: filteredData.length,
    isReverse,
  };
}
