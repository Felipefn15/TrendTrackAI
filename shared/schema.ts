import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trends = pgTable("trends", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  sources: jsonb("sources").notNull(), // Array of source objects with platform, mentions, etc.
  confidence: integer("confidence").notNull(), // 0-100
  trendScore: integer("trend_score").notNull(), // 0-100
  changePercentage: integer("change_percentage"), // Can be negative
  impact: text("impact").notNull(), // "high", "medium", "low"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  trendId: integer("trend_id").references(() => trends.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(), // "high", "medium", "low"
  effort: text("effort").notNull(), // "high", "medium", "low"
  type: text("type").notNull(), // "strategic", "content", "partnership", "quick-win"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  trendsCount: integer("trends_count").notNull(),
  suggestionsCount: integer("suggestions_count").notNull(),
  status: text("status").notNull(), // "generated", "sent", "failed"
  emailsSent: integer("emails_sent").default(0),
  content: jsonb("content"), // Full report data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  enabled: boolean("enabled").default(true),
  lastCheck: timestamp("last_check"),
  status: text("status").default("active"), // "active", "error", "rate_limited"
  errorMessage: text("error_message"),
  config: jsonb("config"), // Platform-specific configuration
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrendSchema = createInsertSchema(trends).omit({
  id: true,
  createdAt: true,
});

export const insertAISuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  lastCheck: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type Trend = typeof trends.$inferSelect;
export type InsertTrend = z.infer<typeof insertTrendSchema>;

export type AISuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAISuggestion = z.infer<typeof insertAISuggestionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
