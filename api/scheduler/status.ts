import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    res.json({
      enabled: true,
      nextScraping: "Next scraping: Every 2 hours",
      nextReport: "Next report: Daily at 6 AM",
      lastRun: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scheduler Status API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}