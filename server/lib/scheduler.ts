import * as cron from 'node-cron';
import { scrapeAllSources } from './scrapers/index.js';
import { analyzeTrends, generateBrandSuggestions, generateEmailSummary } from './openai.js';
import { sendTrendReport } from './email.js';
import { storage } from '../storage.js';

export interface SchedulerConfig {
  dailyReportTime: string; // cron format: "0 6 * * *" for 6 AM daily
  scrapingInterval: string; // cron format: "0 */2 * * *" for every 2 hours
  enabled: boolean;
}

let isScrapingRunning = false;
let isReportRunning = false;

export async function startScheduler(): Promise<void> {
  console.log('Starting TrendScope scheduler...');

  // Get scheduler configuration from settings
  const config = await getSchedulerConfig();

  if (!config.enabled) {
    console.log('Scheduler is disabled in settings');
    return;
  }

  // Schedule daily trend scraping and analysis
  cron.schedule(config.scrapingInterval, async () => {
    if (isScrapingRunning) {
      console.log('Scraping already in progress, skipping...');
      return;
    }

    try {
      isScrapingRunning = true;
      console.log('Starting scheduled trend scraping...');
      await runTrendAnalysis();
    } catch (error) {
      console.error('Scheduled scraping failed:', error);
    } finally {
      isScrapingRunning = false;
    }
  });

  // Schedule daily email reports
  cron.schedule(config.dailyReportTime, async () => {
    if (isReportRunning) {
      console.log('Report generation already in progress, skipping...');
      return;
    }

    try {
      isReportRunning = true;
      console.log('Starting scheduled report generation...');
      await generateAndSendDailyReport();
    } catch (error) {
      console.error('Scheduled report generation failed:', error);
    } finally {
      isReportRunning = false;
    }
  });

  console.log(`Scheduler started with scraping interval: ${config.scrapingInterval}, daily reports at: ${config.dailyReportTime}`);
}

export async function runTrendAnalysis(): Promise<void> {
  try {
    console.log('Starting trend analysis...');

    // Update source status
    await storage.updateSourceStatus('system', 'running', 'Analyzing trends...');

    // Scrape all sources
    const scrapingResult = await scrapeAllSources();
    
    if (!scrapingResult.success || scrapingResult.data.length === 0) {
      throw new Error(`Scraping failed: ${scrapingResult.errors.join(', ')}`);
    }

    console.log(`Collected ${scrapingResult.data.length} data points from sources`);

    // Analyze trends with AI
    const analyzedTrends = await analyzeTrends(scrapingResult.data);
    console.log(`AI identified ${analyzedTrends.length} trends`);

    // Generate brand suggestions
    const suggestions = await generateBrandSuggestions(analyzedTrends);
    console.log(`Generated ${suggestions.length} brand suggestions`);

    // Store trends and suggestions
    const storedTrends = [];
    for (const trend of analyzedTrends) {
      const storedTrend = await storage.createTrend({
        title: trend.title,
        description: trend.description,
        category: trend.category,
        sources: scrapingResult.data.filter(d => 
          d.content.toLowerCase().includes(trend.title.toLowerCase().split(' ')[0])
        ).slice(0, 5), // Related sources
        confidence: trend.confidence,
        trendScore: trend.trendScore,
        changePercentage: trend.changePercentage,
        impact: trend.impact
      });
      storedTrends.push(storedTrend);
    }

    for (const suggestion of suggestions) {
      await storage.createAISuggestion({
        trendId: storedTrends[0]?.id || null, // Associate with first trend for simplicity
        title: suggestion.title,
        description: suggestion.description,
        impact: suggestion.impact,
        effort: suggestion.effort,
        type: suggestion.type
      });
    }

    // Update source statuses
    await storage.updateSourceStatus('reddit', 'active');
    await storage.updateSourceStatus('google-trends', 'active');
    await storage.updateSourceStatus('tiktok', 'active');
    await storage.updateSourceStatus('twitter', 'active');
    await storage.updateSourceStatus('fashion-blogs', 'active');

    console.log('Trend analysis completed successfully');
  } catch (error) {
    console.error('Trend analysis failed:', error);
    await storage.updateSourceStatus('system', 'error', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function generateAndSendDailyReport(): Promise<void> {
  try {
    console.log('Generating daily report...');

    // Get latest trends and suggestions
    const trends = await storage.getRecentTrends(24); // Last 24 hours
    const suggestions = await storage.getRecentSuggestions(24);

    if (trends.length === 0) {
      console.log('No recent trends found, skipping report generation');
      return;
    }

    // Generate email summary
    const summary = await generateEmailSummary(trends, suggestions);

    // Get email recipients from settings
    const recipients = await getEmailRecipients();

    if (recipients.length === 0) {
      console.log('No email recipients configured, skipping email send');
      return;
    }

    // Send email report
    const emailsSent = await sendTrendReport(trends, suggestions, summary, recipients);

    // Create report record
    const today = new Date().toISOString().split('T')[0];
    await storage.createReport({
      date: today,
      trendsCount: trends.length,
      suggestionsCount: suggestions.length,
      status: 'sent',
      emailsSent,
      content: {
        summary,
        trends: trends.slice(0, 10), // Store top 10
        suggestions: suggestions.slice(0, 10)
      }
    });

    console.log(`Daily report generated and sent to ${emailsSent} recipients`);
  } catch (error) {
    console.error('Daily report generation failed:', error);
    
    // Create failed report record
    const today = new Date().toISOString().split('T')[0];
    await storage.createReport({
      date: today,
      trendsCount: 0,
      suggestionsCount: 0,
      status: 'failed',
      emailsSent: 0,
      content: { error: error instanceof Error ? error.message : String(error) }
    });
    
    throw error;
  }
}

async function getSchedulerConfig(): Promise<SchedulerConfig> {
  try {
    const scrapingIntervalSetting = await storage.getSetting('scraping_interval');
    const dailyReportTimeSetting = await storage.getSetting('daily_report_time');
    const schedulerEnabledSetting = await storage.getSetting('scheduler_enabled');

    return {
      scrapingInterval: scrapingIntervalSetting?.value as string || '0 */2 * * *', // Every 2 hours
      dailyReportTime: dailyReportTimeSetting?.value as string || '0 6 * * *', // 6 AM daily
      enabled: schedulerEnabledSetting?.value as boolean ?? true
    };
  } catch (error) {
    console.error('Failed to get scheduler config, using defaults:', error);
    return {
      scrapingInterval: '0 */2 * * *',
      dailyReportTime: '0 6 * * *',
      enabled: true
    };
  }
}

async function getEmailRecipients(): Promise<Array<{ email: string; name?: string }>> {
  try {
    const recipientsSetting = await storage.getSetting('email_recipients');
    return recipientsSetting?.value as Array<{ email: string; name?: string }> || [];
  } catch (error) {
    console.error('Failed to get email recipients:', error);
    return [];
  }
}

export async function stopScheduler(): Promise<void> {
  console.log('Stopping scheduler...');
  cron.getTasks().forEach(task => task.stop());
}

export async function getSchedulerStatus(): Promise<{
  enabled: boolean;
  nextScraping: string | null;
  nextReport: string | null;
  isScrapingRunning: boolean;
  isReportRunning: boolean;
}> {
  const config = await getSchedulerConfig();
  
  return {
    enabled: config.enabled,
    nextScraping: config.enabled ? 'Next scraping scheduled' : null,
    nextReport: config.enabled ? 'Next report scheduled' : null,
    isScrapingRunning,
    isReportRunning
  };
}
