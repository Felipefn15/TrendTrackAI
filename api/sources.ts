import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../server/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    const sources = await storage.getAllSources();
    res.json(sources);
  } catch (error) {
    console.error('Sources API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}