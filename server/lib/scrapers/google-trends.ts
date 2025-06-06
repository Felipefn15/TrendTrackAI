import * as cheerio from 'cheerio';

export async function scrapeGoogleTrends(): Promise<Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}>> {
  try {
    const keywords = [
      'sustainable fashion',
      'vintage clothing',
      'streetwear trends',
      'fashion sustainability',
      'ethical fashion',
      'slow fashion',
      'cottagecore',
      'minimalist fashion',
      'thrift shopping',
      'upcycling fashion'
    ];

    const results = [];

    for (const keyword of keywords) {
      try {
        // Use Google Trends daily trends endpoint (publicly available)
        const response = await fetch(`https://trends.google.com/trends/api/dailytrends?hl=en&tz=-480&geo=US&ns=15`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          console.error('Google Trends API error:', response.status);
          continue;
        }

        let responseText = await response.text();
        // Remove the ")]}'" prefix that Google adds
        responseText = responseText.substring(4);
        
        const data = JSON.parse(responseText);
        
        if (data.default?.trendingSearchesDays?.[0]?.trendingSearches) {
          const trends = data.default.trendingSearchesDays[0].trendingSearches;
          
          for (const trend of trends) {
            const title = trend.title?.query?.toLowerCase() || '';
            const articles = trend.articles || [];
            
            // Check if trend is related to our keywords
            const isRelevant = keywords.some(keyword => 
              title.includes(keyword.toLowerCase()) ||
              articles.some((article: any) => 
                article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                article.snippet?.toLowerCase().includes(keyword.toLowerCase())
              )
            );

            if (isRelevant) {
              const content = `${trend.title?.query} - ${articles[0]?.title || ''} ${articles[0]?.snippet || ''}`.slice(0, 500);
              
              results.push({
                platform: 'google-trends',
                content,
                mentions: parseInt(trend.formattedTraffic?.replace(/[,+]/g, '') || '1000'),
                metadata: {
                  query: trend.title?.query,
                  traffic: trend.formattedTraffic,
                  articles: articles.slice(0, 3).map((article: any) => ({
                    title: article.title,
                    url: article.url,
                    source: article.source
                  }))
                }
              });
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error fetching trends for ${keyword}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Google Trends scraping failed:', error);
    throw new Error('Failed to scrape Google Trends data');
  }
}
