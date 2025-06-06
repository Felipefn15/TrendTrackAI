import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../server/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const path = url?.replace('/api', '') || '/';

  try {
    // Dashboard endpoint
    if (path === '/dashboard' && method === 'GET') {
      const trends = await storage.getRecentTrends(24);
      const suggestions = await storage.getRecentSuggestions(24);
      const sources = await storage.getAllSources();
      const analytics = await storage.getAnalytics();
      
      return res.json({
        trends,
        suggestions,
        sources,
        analytics
      });
    }

    // Scheduler status endpoint
    if (path === '/scheduler/status' && method === 'GET') {
      return res.json({
        enabled: true,
        nextScraping: "Next scraping: Every 2 hours",
        nextReport: "Next report: Daily at 6 AM",
        lastRun: new Date().toISOString()
      });
    }

    // Sources endpoints
    if (path === '/sources' && method === 'GET') {
      const sources = await storage.getAllSources();
      return res.json(sources);
    }

    // Settings endpoints
    if (path === '/settings' && method === 'GET') {
      const settings = await storage.getAllSettings();
      return res.json(settings);
    }

    // Reports endpoints
    if (path === '/reports' && method === 'GET') {
      const reports = await storage.getAllReports();
      return res.json(reports);
    }

    // 404 for unknown routes
    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}