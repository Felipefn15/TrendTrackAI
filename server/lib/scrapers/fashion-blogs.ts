import * as cheerio from 'cheerio';

export async function scrapeFashionBlogs(): Promise<Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
  metadata?: any;
}>> {
  try {
    const blogs = [
      {
        name: 'Vogue',
        url: 'https://www.vogue.com/fashion',
        selector: 'article h2, article h3, article p'
      },
      {
        name: 'Elle',
        url: 'https://www.elle.com/fashion/',
        selector: 'article h1, article h2, article p'
      },
      {
        name: 'Harper\'s Bazaar',
        url: 'https://www.harpersbazaar.com/fashion/',
        selector: 'article h1, article h2, article p'
      },
      {
        name: 'Refinery29',
        url: 'https://www.refinery29.com/en-us/fashion',
        selector: 'article h1, article h2, article p'
      },
      {
        name: 'Who What Wear',
        url: 'https://www.whowhatwear.com/',
        selector: 'article h1, article h2, article p'
      }
    ];

    const results = [];

    for (const blog of blogs) {
      try {
        const response = await fetch(blog.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          console.error(`Fashion blog error for ${blog.name}:`, response.status);
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        
        // Extract article headlines and summaries
        $('article, .article, [class*="article"]').each((_, element) => {
          const $article = $(element);
          const headline = $article.find('h1, h2, h3').first().text().trim();
          const summary = $article.find('p').first().text().trim();
          const link = $article.find('a').first().attr('href');

          if (headline && headline.length > 10) {
            articles.push({
              headline,
              summary: summary.slice(0, 200),
              link: link?.startsWith('http') ? link : `${new URL(blog.url).origin}${link}`
            });
          }
        });

        // Also check for trend-related keywords in main content
        const trendKeywords = [
          'trending', 'trend', 'popular', 'viral', 'buzz', 'hot',
          'sustainable', 'eco-friendly', 'ethical', 'conscious',
          'vintage', 'thrift', 'secondhand', 'upcycle',
          'minimalist', 'capsule', 'slow fashion',
          'cottagecore', 'y2k', 'grunge', 'preppy'
        ];

        const pageText = $('body').text().toLowerCase();
        const relevantContent = [];

        for (const article of articles.slice(0, 10)) {
          const articleText = `${article.headline} ${article.summary}`.toLowerCase();
          const hasRelevantKeywords = trendKeywords.some(keyword => 
            articleText.includes(keyword)
          );

          if (hasRelevantKeywords) {
            relevantContent.push(article);
          }
        }

        // Extract social sharing counts if available
        const socialCounts = [];
        $('[class*="social"], [class*="share"]').each((_, element) => {
          const count = $(element).text().match(/\d+/);
          if (count) {
            socialCounts.push(parseInt(count[0]));
          }
        });

        const avgEngagement = socialCounts.length > 0 
          ? Math.floor(socialCounts.reduce((a, b) => a + b, 0) / socialCounts.length)
          : 50; // Default engagement estimate

        for (const article of relevantContent) {
          const content = `${article.headline} - ${article.summary}`;
          
          results.push({
            platform: 'fashion-blogs',
            content,
            mentions: avgEngagement,
            metadata: {
              source: blog.name,
              url: article.link,
              headline: article.headline,
              socialCounts: socialCounts.slice(0, 3)
            }
          });
        }

        // Rate limiting between blog requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping ${blog.name}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Fashion blogs scraping failed:', error);
    throw new Error('Failed to scrape fashion blog data');
  }
}
