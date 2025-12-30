import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Catalog of economic indicators
 */
export const indicators = mysqlTable("indicators", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 64 }).notNull(), // bcb, ibge, focus
  sourceCode: varchar("sourceCode", { length: 64 }), // API-specific code (e.g., BCB series number)
  unit: varchar("unit", { length: 32 }), // %, R$, index, etc.
  frequency: mysqlEnum("frequency", ["daily", "monthly", "quarterly", "yearly"]).default("monthly").notNull(),
  category: varchar("category", { length: 64 }), // inflation, interest, activity, employment, external
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = typeof indicators.$inferInsert;

/**
 * Time series data for indicators
 */
export const indicatorData = mysqlTable("indicator_data", {
  id: int("id").autoincrement().primaryKey(),
  indicatorId: int("indicatorId").notNull(),
  date: timestamp("date").notNull(),
  value: decimal("value", { precision: 18, scale: 6 }).notNull(),
  periodCode: varchar("periodCode", { length: 16 }), // YYYYMM format for easy querying
  year: int("year"),
  month: int("month"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IndicatorData = typeof indicatorData.$inferSelect;
export type InsertIndicatorData = typeof indicatorData.$inferInsert;

/**
 * Focus market expectations
 */
export const focusExpectations = mysqlTable("focus_expectations", {
  id: int("id").autoincrement().primaryKey(),
  indicator: varchar("indicator", { length: 64 }).notNull(),
  referenceYear: int("referenceYear").notNull(),
  reportDate: timestamp("reportDate").notNull(),
  median: decimal("median", { precision: 18, scale: 4 }),
  mean: decimal("mean", { precision: 18, scale: 4 }),
  min: decimal("min", { precision: 18, scale: 4 }),
  max: decimal("max", { precision: 18, scale: 4 }),
  respondents: int("respondents"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FocusExpectation = typeof focusExpectations.$inferSelect;
export type InsertFocusExpectation = typeof focusExpectations.$inferInsert;

/**
 * Data cache for API responses
 */
export const dataCache = mysqlTable("data_cache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cacheKey", { length: 128 }).notNull().unique(),
  data: json("data"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataCache = typeof dataCache.$inferSelect;
export type InsertDataCache = typeof dataCache.$inferInsert;

/**
 * User alerts configuration
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  indicatorId: int("indicatorId").notNull(),
  alertType: mysqlEnum("alertType", ["threshold_above", "threshold_below", "change_percent"]).notNull(),
  threshold: decimal("threshold", { precision: 18, scale: 4 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggered: timestamp("lastTriggered"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * API keys for external access
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  permissions: json("permissions"), // array of allowed endpoints
  rateLimit: int("rateLimit").default(1000), // requests per day
  requestCount: int("requestCount").default(0),
  lastUsed: timestamp("lastUsed"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Calculation history for monetary correction
 */
export const calculationHistory = mysqlTable("calculation_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  indicatorCode: varchar("indicatorCode", { length: 32 }).notNull(),
  originalValue: decimal("originalValue", { precision: 18, scale: 2 }).notNull(),
  correctedValue: decimal("correctedValue", { precision: 18, scale: 2 }).notNull(),
  startDate: varchar("startDate", { length: 16 }).notNull(),
  endDate: varchar("endDate", { length: 16 }).notNull(),
  factor: decimal("factor", { precision: 18, scale: 8 }).notNull(),
  percentChange: decimal("percentChange", { precision: 18, scale: 4 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = typeof calculationHistory.$inferInsert;
