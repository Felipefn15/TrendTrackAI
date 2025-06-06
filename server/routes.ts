import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertTrendSchema, insertAISuggestionSchema, insertReportSchema, insertSourceSchema, insertSettingSchema } from "@shared/schema.js";
import { scrapeAllSources, scrapeSingleSource } from "./lib/scrapers/index.js";
import { analyzeTrends, generateBrandSuggestions, generateEmailSummary } from "./lib/openai.js";
import { sendTrendReport } from "./lib/email.js";
import { runTrendAnalysis, generateAndSendDailyReport, getSchedulerStatus, startScheduler } from "./lib/scheduler.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analytics & Dashboard
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  app.get("/api/dashboard", async (req, res) => {
    try {
      const [trends, suggestions, sources, analytics] = await Promise.all([
        storage.getRecentTrends(24),
        storage.getRecentSuggestions(24),
        storage.getAllSources(),
        storage.getAnalytics()
      ]);

      res.json({
        trends: trends.slice(0, 10),
        suggestions: suggestions.slice(0, 10),
        sources,
        analytics
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  // Trends
  app.get("/api/trends", async (req, res) => {
    try {
      const { hours } = req.query;
      const trends = hours 
        ? await storage.getRecentTrends(parseInt(hours as string))
        : await storage.getAllTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trends" });
    }
  });

  app.get("/api/trends/:id", async (req, res) => {
    try {
      const trend = await storage.getTrend(parseInt(req.params.id));
      if (!trend) {
        return res.status(404).json({ message: "Trend not found" });
      }
      res.json(trend);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trend" });
    }
  });

  app.post("/api/trends", async (req, res) => {
    try {
      const parsed = insertTrendSchema.parse(req.body);
      const trend = await storage.createTrend(parsed);
      res.status(201).json(trend);
    } catch (error) {
      res.status(400).json({ message: "Invalid trend data" });
    }
  });

  // AI Suggestions
  app.get("/api/suggestions", async (req, res) => {
    try {
      const { trendId, hours } = req.query;
      let suggestions;
      
      if (trendId) {
        suggestions = await storage.getSuggestionsByTrend(parseInt(trendId as string));
      } else if (hours) {
        suggestions = await storage.getRecentSuggestions(parseInt(hours as string));
      } else {
        suggestions = await storage.getAllAISuggestions();
      }
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  app.get("/api/suggestions/:id", async (req, res) => {
    try {
      const suggestion = await storage.getAISuggestion(parseInt(req.params.id));
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suggestion" });
    }
  });

  app.post("/api/suggestions", async (req, res) => {
    try {
      const parsed = insertAISuggestionSchema.parse(req.body);
      const suggestion = await storage.createAISuggestion(parsed);
      res.status(201).json(suggestion);
    } catch (error) {
      res.status(400).json({ message: "Invalid suggestion data" });
    }
  });

  // Reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(parseInt(req.params.id));
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to get report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const parsed = insertReportSchema.parse(req.body);
      const report = await storage.createReport(parsed);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      await generateAndSendDailyReport();
      res.json({ message: "Report generated and sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Sources
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getAllSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sources" });
    }
  });

  app.get("/api/sources/:id", async (req, res) => {
    try {
      const source = await storage.getSource(parseInt(req.params.id));
      if (!source) {
        return res.status(404).json({ message: "Source not found" });
      }
      res.json(source);
    } catch (error) {
      res.status(500).json({ message: "Failed to get source" });
    }
  });

  app.post("/api/sources", async (req, res) => {
    try {
      const parsed = insertSourceSchema.parse(req.body);
      const source = await storage.createSource(parsed);
      res.status(201).json(source);
    } catch (error) {
      res.status(400).json({ message: "Invalid source data" });
    }
  });

  app.put("/api/sources/:id/status", async (req, res) => {
    try {
      const { status, errorMessage } = req.body;
      const source = await storage.getSource(parseInt(req.params.id));
      if (!source) {
        return res.status(404).json({ message: "Source not found" });
      }
      
      await storage.updateSourceStatus(source.platform, status, errorMessage);
      res.json({ message: "Source status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update source status" });
    }
  });

  // Scraping
  app.post("/api/scrape", async (req, res) => {
    try {
      const { platform } = req.body;
      
      let result;
      if (platform) {
        const data = await scrapeSingleSource(platform);
        result = { success: true, data, errors: [], timestamp: new Date().toISOString() };
      } else {
        result = await scrapeAllSources();
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Scraping failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      await runTrendAnalysis();
      res.json({ message: "Trend analysis completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Trend analysis failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to get setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Email
  app.post("/api/email/test", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email address required" });
      }

      const trends = await storage.getRecentTrends(24);
      const suggestions = await storage.getRecentSuggestions(24);
      const summary = await generateEmailSummary(trends.slice(0, 3), suggestions.slice(0, 3));
      
      await sendTrendReport(trends.slice(0, 3), suggestions.slice(0, 3), summary, [{ email }]);
      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send test email", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Scheduler
  app.get("/api/scheduler/status", async (req, res) => {
    try {
      const status = await getSchedulerStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scheduler status" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  const httpServer = createServer(app);

  // Start the scheduler when the server starts
  startScheduler().catch(console.error);

  return httpServer;
}
