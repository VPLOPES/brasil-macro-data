/**
 * BCB (Banco Central do Brasil) Data Service
 * Fetches economic data from BCB SGS API
 */

import axios from "axios";

const BCB_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const HEADERS = {
  "User-Agent": "BrasilMacroData/1.0",
  Accept: "application/json",
};

export interface BCBDataPoint {
  data: string; // DD/MM/YYYY format
  valor: string;
}

export interface ProcessedDataPoint {
  date: Date;
  value: number;
  periodCode: string;
  year: number;
  month: number;
}

// BCB Series codes for main indicators
export const BCB_SERIES = {
  // Interest rates
  SELIC_DAILY: "11", // Taxa SELIC diária
  SELIC_TARGET: "432", // Meta SELIC
  SELIC_MONTHLY: "4390", // SELIC acumulada no mês
  CDI_MONTHLY: "4391", // CDI acumulado no mês

  // Inflation
  IGP_M: "189", // IGP-M mensal
  IGP_DI: "190", // IGP-DI mensal
  IPA_M: "225", // IPA-M mensal

  // Exchange rates
  USD_BRL_SELL: "10813", // Dólar comercial venda (PTAX)
  USD_BRL_BUY: "10814", // Dólar comercial compra (PTAX)
  EUR_BRL: "21619", // Euro

  // Economic activity
  IBC_BR: "24363", // IBC-Br (proxy mensal do PIB)
  PIB_MONTHLY: "4380", // PIB mensal

  // Fiscal
  DEBT_GDP: "4513", // Dívida líquida % PIB
  PRIMARY_RESULT: "5793", // Resultado primário % PIB
  NOMINAL_RESULT: "5811", // Resultado nominal % PIB

  // External sector
  TRADE_BALANCE: "22707", // Balança comercial
  CURRENT_ACCOUNT: "22724", // Transações correntes
  FDI: "22885", // IDP (Investimento Direto no País)

  // Credit
  CREDIT_TOTAL: "20539", // Crédito total
} as const;

/**
 * Fetch data from BCB SGS API
 */
// Daily series that require date range (10 year max window)
const DAILY_SERIES = ["10813", "10814", "21619", "1", "11"];

export async function fetchBCBSeries(
  seriesCode: string,
  lastN?: number
): Promise<BCBDataPoint[]> {
  try {
    let url: string;
    
    // Check if this is a daily series that needs date range
    const isDailySeries = DAILY_SERIES.includes(seriesCode);
    
    if (isDailySeries) {
      // For daily series, use date range (last 2 years for exchange rates)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      
      const formatDate = (d: Date) => 
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      
      url = `${BCB_BASE_URL}.${seriesCode}/dados?formato=json&dataInicial=${formatDate(startDate)}&dataFinal=${formatDate(endDate)}`;
    } else {
      // Use /ultimos endpoint with max 20 items (BCB limit)
      const limit = Math.min(lastN || 20, 20);
      url = `${BCB_BASE_URL}.${seriesCode}/dados/ultimos/${limit}?formato=json`;
    }

    console.log(`[BCB] Fetching: ${url}`);
    
    const response = await axios.get<BCBDataPoint[]>(url, {
      headers: HEADERS,
      timeout: 30000,
    });

    // Ensure we always return an array
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`[BCB] Series ${seriesCode} returned non-array data:`, typeof response.data);
      return [];
    }

    let data = response.data;
    console.log(`[BCB] Series ${seriesCode} returned ${data.length} items`);
    
    // If we requested specific number, slice from the end
    if (lastN && data.length > lastN) {
      data = data.slice(-lastN);
    }

    return data;
  } catch (error: any) {
    console.error(`[BCB] Error fetching series ${seriesCode}:`, error?.message || error);
    return [];
  }
}

/**
 * Process BCB data into standardized format
 */
export function processBCBData(data: BCBDataPoint[]): ProcessedDataPoint[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data
    .map((item) => {
      const [day, month, year] = item.data.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      const value = parseFloat(item.valor);

      if (isNaN(value) || isNaN(date.getTime())) {
        return null;
      }

      return {
        date,
        value,
        periodCode: `${year}${String(month).padStart(2, "0")}`,
        year,
        month,
      };
    })
    .filter((item): item is ProcessedDataPoint => item !== null);
}

/**
 * Fetch and process BCB series
 */
export async function getBCBIndicator(
  seriesCode: string,
  lastN?: number
): Promise<ProcessedDataPoint[]> {
  const rawData = await fetchBCBSeries(seriesCode, lastN);
  return processBCBData(rawData);
}

/**
 * Fetch Focus market expectations
 */
export interface FocusExpectation {
  Indicador: string;
  Data: string;
  DataReferencia: string;
  Mediana: number;
  Media: number;
  Minimo: number;
  Maximo: number;
  numeroRespondentes: number;
}

export async function fetchFocusExpectations(
  indicator?: string
): Promise<FocusExpectation[]> {
  try {
    const baseUrl =
      "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais";

    let filter = "";
    if (indicator) {
      filter = `&$filter=Indicador eq '${indicator}'`;
    }

    const url = `${baseUrl}?$top=1000&$orderby=Data desc${filter}&$format=json`;

    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
    });

    return response.data?.value || [];
  } catch (error) {
    console.error("[BCB] Error fetching Focus expectations:", error);
    return [];
  }
}

/**
 * Get latest value for a series
 */
export async function getLatestBCBValue(
  seriesCode: string
): Promise<ProcessedDataPoint | null> {
  const data = await getBCBIndicator(seriesCode, 1);
  return data.length > 0 ? data[data.length - 1] : null;
}

/**
 * Calculate accumulated value over a period
 */
export function calculateAccumulated(
  data: ProcessedDataPoint[],
  months: number
): number | null {
  if (data.length < months) return null;

  const recentData = data.slice(-months);
  const factor = recentData.reduce((acc, item) => acc * (1 + item.value / 100), 1);
  return (factor - 1) * 100;
}

/**
 * Calculate year-to-date accumulated
 */
export function calculateYTD(data: ProcessedDataPoint[]): number | null {
  const currentYear = new Date().getFullYear();
  const ytdData = data.filter((item) => item.year === currentYear);

  if (ytdData.length === 0) return null;

  const factor = ytdData.reduce((acc, item) => acc * (1 + item.value / 100), 1);
  return (factor - 1) * 100;
}
