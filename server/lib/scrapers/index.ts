import { scrapeReddit } from './reddit.js';
import { scrapeGoogleTrends } from './google-trends.js';
import { scrapeTikTok } from './tiktok.js';
import { scrapeTwitter } from './twitter.js';
import { scrapeFashionBlogs } from './fashion-blogs.js';

export interface ScrapedData {
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}

export interface ScrapingResult {
  success: boolean;
  data: ScrapedData[];
  errors: string[];
  timestamp: string;
}

export async function scrapeAllSources(): Promise<ScrapingResult> {
  const result: ScrapingResult = {
    success: false,
    data: [],
    errors: [],
    timestamp: new Date().toISOString()
  };

  const scrapers = [
    { name: 'Reddit', fn: scrapeReddit },
    { name: 'Google Trends', fn: scrapeGoogleTrends },
    { name: 'TikTok', fn: scrapeTikTok },
    { name: 'Twitter/X', fn: scrapeTwitter },
    { name: 'Fashion Blogs', fn: scrapeFashionBlogs }
  ];

  let successfulScrapes = 0;

  for (const scraper of scrapers) {
    try {
      console.log(`Starting ${scraper.name} scraping...`);
      const data = await scraper.fn();
      result.data.push(...data);
      successfulScrapes++;
      console.log(`${scraper.name} scraping completed: ${data.length} items`);
    } catch (error) {
      const errorMessage = `${scraper.name} scraping failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      result.errors.push(errorMessage);
    }
  }

  result.success = successfulScrapes > 0;
  
  console.log(`Scraping completed: ${successfulScrapes}/${scrapers.length} sources successful, ${result.data.length} total items collected`);
  
  return result;
}

export async function scrapeSingleSource(platform: string): Promise<ScrapedData[]> {
  switch (platform.toLowerCase()) {
    case 'reddit':
      return await scrapeReddit();
    case 'google-trends':
      return await scrapeGoogleTrends();
    case 'tiktok':
      return await scrapeTikTok();
    case 'twitter':
    case 'x':
      return await scrapeTwitter();
    case 'fashion-blogs':
      return await scrapeFashionBlogs();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function validateScrapedData(data: ScrapedData[]): ScrapedData[] {
  return data.filter(item => {
    // Basic validation
    if (!item.platform || !item.content || typeof item.mentions !== 'number') {
      return false;
    }
    
    // Content length validation
    if (item.content.length < 10 || item.content.length > 1000) {
      return false;
    }
    
    // Mentions validation
    if (item.mentions < 0 || item.mentions > 10000000) {
      return false;
    }
    
    return true;
  });
}
