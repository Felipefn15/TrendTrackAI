interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  subreddit: string;
  url: string;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

export async function scrapeReddit(): Promise<Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}>> {
  try {
    const subreddits = [
      'fashion',
      'streetwear',
      'malefashionadvice',
      'femalefashionadvice',
      'sustainability',
      'thriftstorehauls',
      'frugalmalefashion',
      'womensstreetwear'
    ];

    const results = [];
    
    for (const subreddit of subreddits) {
      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
          headers: {
            'User-Agent': 'TrendScope/1.0 (Cultural Trends Monitor)'
          }
        });

        if (!response.ok) {
          console.error(`Reddit API error for r/${subreddit}:`, response.status);
          continue;
        }

        const data: RedditResponse = await response.json();
        
        for (const post of data.data.children) {
          const postData = post.data;
          
          // Filter for relevant posts with decent engagement
          if (postData.score > 50 && postData.num_comments > 10) {
            const content = `${postData.title} ${postData.selftext}`.slice(0, 500);
            
            results.push({
              platform: 'reddit',
              content,
              mentions: postData.score,
              engagement: postData.num_comments,
              metadata: {
                subreddit: postData.subreddit,
                url: postData.url,
                created: new Date(postData.created_utc * 1000).toISOString()
              }
            });
          }
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping r/${subreddit}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Reddit scraping failed:', error);
    throw new Error('Failed to scrape Reddit data');
  }
}
