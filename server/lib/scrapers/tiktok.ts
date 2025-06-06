import * as cheerio from 'cheerio';

export async function scrapeTikTok(): Promise<Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}>> {
  try {
    const hashtags = [
      'sustainablefashion',
      'thrifting',
      'vintagefashion',
      'fashiontok',
      'outfit',
      'style',
      'cottagecore',
      'slowfashion',
      'upcycling',
      'ethicalfashion'
    ];

    const results = [];

    for (const hashtag of hashtags) {
      try {
        // TikTok's web interface for hashtag exploration
        const response = await fetch(`https://www.tiktok.com/tag/${hashtag}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          console.error(`TikTok hashtag error for #${hashtag}:`, response.status);
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract hashtag view count from meta tags or structured data
        const viewCountText = $('meta[name="description"]').attr('content') || '';
        const viewMatch = viewCountText.match(/([\d.]+[KMB])\s*views?/i);
        const viewCount = viewMatch ? parseViewCount(viewMatch[1]) : 100000;

        // Look for trend indicators in the page
        const trendIndicators = [];
        $('script[type="application/ld+json"]').each((_, element) => {
          try {
            const jsonData = JSON.parse($(element).html() || '{}');
            if (jsonData.name || jsonData.description) {
              trendIndicators.push({
                name: jsonData.name,
                description: jsonData.description
              });
            }
          } catch (e) {
            // Ignore invalid JSON
          }
        });

        const content = `TikTok hashtag #${hashtag} trending with ${viewMatch?.[1] || 'significant'} views. ${trendIndicators.map(t => t.description).join(' ').slice(0, 300)}`;

        results.push({
          platform: 'tiktok',
          content,
          mentions: viewCount,
          metadata: {
            hashtag,
            viewCount: viewMatch?.[1] || 'N/A',
            url: `https://www.tiktok.com/tag/${hashtag}`,
            indicators: trendIndicators.slice(0, 3)
          }
        });

        // Rate limiting to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error scraping TikTok hashtag #${hashtag}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('TikTok scraping failed:', error);
    throw new Error('Failed to scrape TikTok data');
  }
}

function parseViewCount(viewString: string): number {
  const num = parseFloat(viewString);
  const suffix = viewString.slice(-1).toUpperCase();
  
  switch (suffix) {
    case 'K': return Math.floor(num * 1000);
    case 'M': return Math.floor(num * 1000000);
    case 'B': return Math.floor(num * 1000000000);
    default: return Math.floor(num);
  }
}
