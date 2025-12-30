/**
 * IBGE/SIDRA Data Service
 * Fetches economic data from IBGE SIDRA API
 */

import axios from "axios";

const SIDRA_BASE_URL = "https://apisidra.ibge.gov.br/values";
const HEADERS = {
  "User-Agent": "BrasilMacroData/1.0",
  Accept: "application/json",
};

export interface SidraDataPoint {
  V: string; // Value
  D3C: string; // Period code (YYYYMM)
  D3N: string; // Period name
  [key: string]: string;
}

export interface ProcessedDataPoint {
  date: Date;
  value: number;
  periodCode: string;
  year: number;
  month: number;
  periodName: string;
}

// SIDRA table configurations
export const SIDRA_TABLES = {
  // Inflation
  IPCA: {
    table: "1737",
    variable: "63",
    name: "IPCA",
    description: "Índice Nacional de Preços ao Consumidor Amplo",
  },
  INPC: {
    table: "1736",
    variable: "44",
    name: "INPC",
    description: "Índice Nacional de Preços ao Consumidor",
  },
  IPCA15: {
    table: "3065",
    variable: "355",
    name: "IPCA-15",
    description: "IPCA-15 - Prévia da inflação",
  },

  // Employment
  UNEMPLOYMENT: {
    table: "6381",
    variable: "4099",
    name: "Taxa de Desocupação",
    description: "Taxa de desocupação PNAD Contínua",
  },

  // Industrial Production
  INDUSTRIAL_PRODUCTION: {
    table: "8159",
    variable: "11599",
    name: "Produção Industrial",
    description: "Produção Industrial Mensal - PIM-PF",
  },

  // Retail Sales
  RETAIL_SALES: {
    table: "8880",
    variable: "11706",
    name: "Vendas do Varejo",
    description: "Pesquisa Mensal de Comércio - PMC",
  },

  // Services
  SERVICES: {
    table: "8161",
    variable: "11621",
    name: "Volume de Serviços",
    description: "Pesquisa Mensal de Serviços - PMS",
  },

  // GDP
  GDP_QUARTERLY: {
    table: "1846",
    variable: "585",
    name: "PIB Trimestral",
    description: "PIB a preços de mercado - variação trimestral",
  },
} as const;

/**
 * Build SIDRA API URL
 */
function buildSidraUrl(
  tableCode: string,
  variableCode: string,
  periods: number = 120
): string {
  return `${SIDRA_BASE_URL}/t/${tableCode}/n1/all/v/${variableCode}/p/last%20${periods}/d/v${variableCode}%202`;
}

/**
 * Fetch data from SIDRA API
 */
export async function fetchSidraData(
  tableCode: string,
  variableCode: string,
  periods: number = 120
): Promise<SidraDataPoint[]> {
  try {
    const url = buildSidraUrl(tableCode, variableCode, periods);
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 20000,
    });

    // SIDRA returns array with header row at index 0
    const data = response.data;
    if (!Array.isArray(data) || data.length <= 1) {
      return [];
    }

    return data.slice(1) as SidraDataPoint[];
  } catch (error) {
    console.error(`[IBGE] Error fetching table ${tableCode}:`, error);
    return [];
  }
}

/**
 * Process SIDRA data into standardized format
 */
export function processSidraData(data: SidraDataPoint[]): ProcessedDataPoint[] {
  return data
    .map((item) => {
      const periodCode = item.D3C;
      const value = parseFloat(item.V);

      if (!periodCode || isNaN(value)) {
        return null;
      }

      // Handle different period formats
      let year: number;
      let month: number;
      let date: Date;

      if (periodCode.length === 6) {
        // Monthly: YYYYMM
        year = parseInt(periodCode.slice(0, 4));
        month = parseInt(periodCode.slice(4, 6));
        date = new Date(year, month - 1, 1);
      } else if (periodCode.length === 5) {
        // Quarterly: YYYYQ (e.g., 20241 for Q1 2024)
        year = parseInt(periodCode.slice(0, 4));
        const quarter = parseInt(periodCode.slice(4));
        month = quarter * 3;
        date = new Date(year, month - 1, 1);
      } else {
        return null;
      }

      return {
        date,
        value,
        periodCode,
        year,
        month,
        periodName: item.D3N || "",
      };
    })
    .filter((item): item is ProcessedDataPoint => item !== null);
}

/**
 * Fetch and process SIDRA indicator
 */
export async function getSidraIndicator(
  tableCode: string,
  variableCode: string,
  periods: number = 120
): Promise<ProcessedDataPoint[]> {
  const rawData = await fetchSidraData(tableCode, variableCode, periods);
  return processSidraData(rawData);
}

/**
 * Get IPCA data
 */
export async function getIPCA(periods: number = 120): Promise<ProcessedDataPoint[]> {
  const config = SIDRA_TABLES.IPCA;
  return getSidraIndicator(config.table, config.variable, periods);
}

/**
 * Get INPC data
 */
export async function getINPC(periods: number = 120): Promise<ProcessedDataPoint[]> {
  const config = SIDRA_TABLES.INPC;
  return getSidraIndicator(config.table, config.variable, periods);
}

/**
 * Get unemployment rate
 */
export async function getUnemployment(
  periods: number = 48
): Promise<ProcessedDataPoint[]> {
  const config = SIDRA_TABLES.UNEMPLOYMENT;
  return getSidraIndicator(config.table, config.variable, periods);
}

/**
 * Get industrial production
 */
export async function getIndustrialProduction(
  periods: number = 60
): Promise<ProcessedDataPoint[]> {
  const config = SIDRA_TABLES.INDUSTRIAL_PRODUCTION;
  return getSidraIndicator(config.table, config.variable, periods);
}

/**
 * Get retail sales
 */
export async function getRetailSales(
  periods: number = 60
): Promise<ProcessedDataPoint[]> {
  const config = SIDRA_TABLES.RETAIL_SALES;
  return getSidraIndicator(config.table, config.variable, periods);
}

/**
 * Calculate accumulated inflation
 */
export function calculateAccumulatedInflation(
  data: ProcessedDataPoint[],
  months: number
): number | null {
  if (data.length < months) return null;

  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const recentData = sortedData.slice(-months);

  const factor = recentData.reduce((acc, item) => acc * (1 + item.value / 100), 1);
  return (factor - 1) * 100;
}

/**
 * Calculate year-to-date inflation
 */
export function calculateYTDInflation(data: ProcessedDataPoint[]): number | null {
  const currentYear = new Date().getFullYear();
  const ytdData = data.filter((item) => item.year === currentYear);

  if (ytdData.length === 0) return null;

  const factor = ytdData.reduce((acc, item) => acc * (1 + item.value / 100), 1);
  return (factor - 1) * 100;
}
