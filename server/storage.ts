import { trends, aiSuggestions, reports, sources, settings, type Trend, type InsertTrend, type AISuggestion, type InsertAISuggestion, type Report, type InsertReport, type Source, type InsertSource, type Setting, type InsertSetting } from "@shared/schema";

export interface IStorage {
  // Trends
  getTrend(id: number): Promise<Trend | undefined>;
  getAllTrends(): Promise<Trend[]>;
  getRecentTrends(hours: number): Promise<Trend[]>;
  createTrend(trend: InsertTrend): Promise<Trend>;
  
  // AI Suggestions
  getAISuggestion(id: number): Promise<AISuggestion | undefined>;
  getAllAISuggestions(): Promise<AISuggestion[]>;
  getRecentSuggestions(hours: number): Promise<AISuggestion[]>;
  getSuggestionsByTrend(trendId: number): Promise<AISuggestion[]>;
  createAISuggestion(suggestion: InsertAISuggestion): Promise<AISuggestion>;
  
  // Reports
  getReport(id: number): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  getReportByDate(date: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  
  // Sources
  getSource(id: number): Promise<Source | undefined>;
  getAllSources(): Promise<Source[]>;
  getSourceByPlatform(platform: string): Promise<Source | undefined>;
  createSource(source: InsertSource): Promise<Source>;
  updateSourceStatus(platform: string, status: string, errorMessage?: string): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: any): Promise<Setting>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalTrends: number;
    totalSuggestions: number;
    totalReports: number;
    activeSourcesCount: number;
    lastReportDate?: string;
  }>;
}

export class MemStorage implements IStorage {
  private trends: Map<number, Trend>;
  private aiSuggestions: Map<number, AISuggestion>;
  private reports: Map<number, Report>;
  private sources: Map<number, Source>;
  private settings: Map<string, Setting>;
  private currentTrendId: number;
  private currentSuggestionId: number;
  private currentReportId: number;
  private currentSourceId: number;
  private currentSettingId: number;

  constructor() {
    this.trends = new Map();
    this.aiSuggestions = new Map();
    this.reports = new Map();
    this.sources = new Map();
    this.settings = new Map();
    this.currentTrendId = 1;
    this.currentSuggestionId = 1;
    this.currentReportId = 1;
    this.currentSourceId = 1;
    this.currentSettingId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default sources
    const defaultSources = [
      { name: 'Reddit', platform: 'reddit', enabled: true, status: 'active' },
      { name: 'Google Trends', platform: 'google-trends', enabled: true, status: 'active' },
      { name: 'TikTok', platform: 'tiktok', enabled: true, status: 'active' },
      { name: 'Twitter/X', platform: 'twitter', enabled: true, status: 'active' },
      { name: 'Fashion Blogs', platform: 'fashion-blogs', enabled: true, status: 'active' }
    ];

    for (const source of defaultSources) {
      this.createSource(source);
    }

    // Initialize default settings
    const defaultSettings = [
      { key: 'email_recipients', value: [] },
      { key: 'daily_report_time', value: '0 6 * * *' },
      { key: 'scraping_interval', value: '0 */2 * * *' },
      { key: 'scheduler_enabled', value: true },
      { key: 'brand_category', value: 'fashion' },
      { key: 'target_audience', value: 'Gen Z, Millennials, Sustainable fashion enthusiasts' },
      { key: 'focus_keywords', value: ['sustainable fashion', 'ethical clothing', 'minimalist style', 'cottagecore', 'vintage fashion'] }
    ];

    for (const setting of defaultSettings) {
      this.updateSetting(setting.key, setting.value);
    }
  }

  // Trends
  async getTrend(id: number): Promise<Trend | undefined> {
    return this.trends.get(id);
  }

  async getAllTrends(): Promise<Trend[]> {
    return Array.from(this.trends.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRecentTrends(hours: number): Promise<Trend[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.trends.values())
      .filter(trend => new Date(trend.createdAt!) > cutoffTime)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createTrend(insertTrend: InsertTrend): Promise<Trend> {
    const id = this.currentTrendId++;
    const trend: Trend = {
      ...insertTrend,
      id,
      createdAt: new Date()
    };
    this.trends.set(id, trend);
    return trend;
  }

  // AI Suggestions
  async getAISuggestion(id: number): Promise<AISuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async getAllAISuggestions(): Promise<AISuggestion[]> {
    return Array.from(this.aiSuggestions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRecentSuggestions(hours: number): Promise<AISuggestion[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => new Date(suggestion.createdAt!) > cutoffTime)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getSuggestionsByTrend(trendId: number): Promise<AISuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.trendId === trendId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAISuggestion(insertSuggestion: InsertAISuggestion): Promise<AISuggestion> {
    const id = this.currentSuggestionId++;
    const suggestion: AISuggestion = {
      ...insertSuggestion,
      id,
      createdAt: new Date()
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  // Reports
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getReportByDate(date: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(report => report.date === date);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const report: Report = {
      ...insertReport,
      id,
      createdAt: new Date()
    };
    this.reports.set(id, report);
    return report;
  }

  // Sources
  async getSource(id: number): Promise<Source | undefined> {
    return this.sources.get(id);
  }

  async getAllSources(): Promise<Source[]> {
    return Array.from(this.sources.values());
  }

  async getSourceByPlatform(platform: string): Promise<Source | undefined> {
    return Array.from(this.sources.values()).find(source => source.platform === platform);
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = this.currentSourceId++;
    const source: Source = {
      ...insertSource,
      id,
      lastCheck: null
    };
    this.sources.set(id, source);
    return source;
  }

  async updateSourceStatus(platform: string, status: string, errorMessage?: string): Promise<void> {
    const source = await this.getSourceByPlatform(platform);
    if (source) {
      source.status = status;
      source.lastCheck = new Date();
      source.errorMessage = errorMessage || null;
      this.sources.set(source.id, source);
    }
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async updateSetting(key: string, value: any): Promise<Setting> {
    const existingSetting = this.settings.get(key);
    if (existingSetting) {
      existingSetting.value = value;
      existingSetting.updatedAt = new Date();
      this.settings.set(key, existingSetting);
      return existingSetting;
    } else {
      const id = this.currentSettingId++;
      const setting: Setting = {
        id,
        key,
        value,
        updatedAt: new Date()
      };
      this.settings.set(key, setting);
      return setting;
    }
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalTrends: number;
    totalSuggestions: number;
    totalReports: number;
    activeSourcesCount: number;
    lastReportDate?: string;
  }> {
    const reports = await this.getAllReports();
    const lastReport = reports[0]; // Most recent due to sorting

    return {
      totalTrends: this.trends.size,
      totalSuggestions: this.aiSuggestions.size,
      totalReports: this.reports.size,
      activeSourcesCount: Array.from(this.sources.values()).filter(s => s.enabled && s.status === 'active').length,
      lastReportDate: lastReport?.date
    };
  }
}

export const storage = new MemStorage();
