import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getIndicatorData,
  getIndicatorSummary,
  getAllIndicatorsSummary,
  getFocusSummary,
  calculateMonetaryCorrection,
  INDICATORS_CONFIG,
} from "./services/indicatorService";
import { fetchFocusExpectations } from "./services/bcbService";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Indicators router
  indicators: router({
    // Get all available indicators config
    list: publicProcedure.query(() => {
      return Object.values(INDICATORS_CONFIG);
    }),

    // Get summary of all main indicators
    summary: publicProcedure.query(async () => {
      return getAllIndicatorsSummary();
    }),

    // Get single indicator summary
    getSummary: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return getIndicatorSummary(input.code);
      }),

    // Get indicator time series data
    getData: publicProcedure
      .input(
        z.object({
          code: z.string(),
          periods: z.number().min(1).max(360).default(120),
        })
      )
      .query(async ({ input }) => {
        return getIndicatorData(input.code, input.periods);
      }),

    // Get multiple indicators data at once
    getMultiple: publicProcedure
      .input(
        z.object({
          codes: z.array(z.string()),
          periods: z.number().min(1).max(360).default(60),
        })
      )
      .query(async ({ input }) => {
        const results = await Promise.all(
          input.codes.map((code) => getIndicatorData(code, input.periods))
        );
        return results.filter((r) => r !== null);
      }),
  }),

  // Focus market expectations router
  focus: router({
    // Get Focus summary for main indicators
    summary: publicProcedure.query(async () => {
      return getFocusSummary();
    }),

    // Get detailed Focus data for specific indicator
    getIndicator: publicProcedure
      .input(z.object({ indicator: z.string() }))
      .query(async ({ input }) => {
        return fetchFocusExpectations(input.indicator);
      }),
  }),

  // Calculator router
  calculator: router({
    // Calculate monetary correction
    correct: publicProcedure
      .input(
        z.object({
          indicatorCode: z.string(),
          value: z.number().positive(),
          startPeriod: z.string().regex(/^\d{6}$/), // YYYYMM format
          endPeriod: z.string().regex(/^\d{6}$/),
        })
      )
      .mutation(async ({ input }) => {
        const result = await calculateMonetaryCorrection(
          input.indicatorCode,
          input.value,
          input.startPeriod,
          input.endPeriod
        );

        if (!result) {
          throw new Error("Não foi possível calcular a correção para o período selecionado");
        }

        return result;
      }),

    // Get available indices for correction
    availableIndices: publicProcedure.query(() => {
      return [
        { code: "IPCA", name: "IPCA", description: "Inflação oficial" },
        { code: "INPC", name: "INPC", description: "Índice de preços ao consumidor" },
        { code: "IGP_M", name: "IGP-M", description: "Índice geral de preços" },
        { code: "SELIC", name: "SELIC", description: "Taxa básica de juros" },
        { code: "CDI", name: "CDI", description: "Certificado de depósito interbancário" },
      ];
    }),
  }),

  // Export router
  export: router({
    // Export indicator data as CSV
    csv: publicProcedure
      .input(
        z.object({
          code: z.string(),
          periods: z.number().min(1).max(360).default(120),
        })
      )
      .query(async ({ input }) => {
        const data = await getIndicatorData(input.code, input.periods);
        if (!data) return null;

        const config = INDICATORS_CONFIG[input.code as keyof typeof INDICATORS_CONFIG];
        const header = `Data,${config?.name || input.code} (${config?.unit || ""})\n`;
        const rows = data.data
          .map((d) => {
            const dateStr = d.date.toISOString().split("T")[0];
            return `${dateStr},${d.value}`;
          })
          .join("\n");

        return {
          filename: `${input.code}_${new Date().toISOString().split("T")[0]}.csv`,
          content: header + rows,
          mimeType: "text/csv",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
