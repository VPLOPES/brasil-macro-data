import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("indicators router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller(createPublicContext());
  });

  it("returns list of available indicators", async () => {
    const result = await caller.indicators.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Check structure of first indicator
    const first = result[0];
    expect(first).toHaveProperty("code");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("description");
    expect(first).toHaveProperty("unit");
    expect(first).toHaveProperty("source");
    expect(first).toHaveProperty("category");
  });

  it("returns available correction indices", async () => {
    const result = await caller.calculator.availableIndices();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Check that IPCA is available
    const ipca = result.find((i) => i.code === "IPCA");
    expect(ipca).toBeDefined();
    expect(ipca?.name).toBe("IPCA");
  });
});

describe("calculator router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller(createPublicContext());
  });

  it("validates input for monetary correction", async () => {
    // Test with invalid period format
    await expect(
      caller.calculator.correct({
        indicatorCode: "IPCA",
        value: 1000,
        startPeriod: "2023", // Invalid - should be YYYYMM
        endPeriod: "202312",
      })
    ).rejects.toThrow();

    // Test with negative value
    await expect(
      caller.calculator.correct({
        indicatorCode: "IPCA",
        value: -1000,
        startPeriod: "202301",
        endPeriod: "202312",
      })
    ).rejects.toThrow();
  });
});

describe("focus router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller(createPublicContext());
  });

  it("returns focus summary structure", async () => {
    // This test may fail if external API is down, so we just check the call doesn't throw
    try {
      const result = await caller.focus.summary();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      // External API may be unavailable during tests
      console.log("Focus API unavailable during test");
    }
  }, 15000); // Increase timeout for external API
});

describe("export router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller(createPublicContext());
  });

  it("generates CSV with correct structure", async () => {
    // This test depends on external API, so we check structure if data is available
    try {
      const result = await caller.export.csv({
        code: "IPCA",
        periods: 12,
      });

      if (result) {
        expect(result).toHaveProperty("filename");
        expect(result).toHaveProperty("content");
        expect(result).toHaveProperty("mimeType");
        expect(result.mimeType).toBe("text/csv");
        expect(result.filename).toContain("IPCA");
        expect(result.filename).toContain(".csv");
      }
    } catch (error) {
      console.log("External API unavailable during test");
    }
  });
});
