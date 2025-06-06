export async function scrapeTwitter(): Promise<Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}>> {
  try {
    const twitterApiKey = process.env.TWITTER_API_KEY || process.env.X_API_KEY || '';
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN || '';

    if (!twitterBearerToken) {
      console.error('Twitter/X API credentials not found');
      throw new Error('Twitter/X API credentials not configured');
    }

    const keywords = [
      'sustainable fashion',
      'ethical fashion',
      'slow fashion',
      'thrift fashion',
      'vintage style',
      'fashion sustainability',
      'circular fashion',
      'eco fashion',
      'minimalist fashion',
      'cottagecore'
    ];

    const results = [];

    for (const keyword of keywords) {
      try {
        const searchUrl = `https://api.twitter.com/2/tweets/search/recent`;
        const params = new URLSearchParams({
          query: `"${keyword}" lang:en -is:retweet`,
          max_results: '20',
          'tweet.fields': 'author_id,created_at,public_metrics,context_annotations',
          'user.fields': 'username,verified'
        });

        const response = await fetch(`${searchUrl}?${params}`, {
          headers: {
            'Authorization': `Bearer ${twitterBearerToken}`,
            'User-Agent': 'TrendScope/1.0'
          }
        });

        if (!response.ok) {
          console.error(`Twitter API error for "${keyword}":`, response.status);
          if (response.status === 429) {
            console.log('Twitter rate limit hit, skipping remaining keywords');
            break;
          }
          continue;
        }

        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          for (const tweet of data.data) {
            const metrics = tweet.public_metrics;
            const engagement = metrics.retweet_count + metrics.like_count + metrics.reply_count + metrics.quote_count;
            
            // Filter for tweets with decent engagement
            if (engagement > 10) {
              results.push({
                platform: 'twitter',
                content: tweet.text.slice(0, 500),
                mentions: metrics.retweet_count + metrics.quote_count,
                engagement,
                metadata: {
                  keyword,
                  tweet_id: tweet.id,
                  author_id: tweet.author_id,
                  created_at: tweet.created_at,
                  metrics: metrics,
                  context: tweet.context_annotations || []
                }
              });
            }
          }
        }

        // Twitter rate limiting - 300 requests per 15-minute window
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error searching Twitter for "${keyword}":`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Twitter scraping failed:', error);
    throw new Error('Failed to scrape Twitter/X data');
  }
}
