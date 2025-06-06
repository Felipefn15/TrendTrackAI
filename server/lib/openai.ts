import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

export interface AnalyzedTrend {
  title: string;
  description: string;
  category: string;
  confidence: number;
  trendScore: number;
  changePercentage: number;
  impact: "high" | "medium" | "low";
}

export interface BrandSuggestion {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  type: "strategic" | "content" | "partnership" | "quick-win";
}

export async function analyzeTrends(rawData: Array<{
  platform: string;
  content: string;
  mentions: number;
  engagement?: number;
}>): Promise<AnalyzedTrend[]> {
  try {
    const prompt = `
    Analyze the following cultural trend data for fashion/lifestyle brands and extract meaningful trends.
    
    Data: ${JSON.stringify(rawData)}
    
    Please identify and analyze trends focusing on:
    - Fashion and lifestyle relevance
    - Cultural significance
    - Brand opportunity potential
    - Trend momentum and growth
    
    For each trend, provide:
    - title: Clear, engaging trend name
    - description: 2-3 sentences explaining the trend and its cultural significance
    - category: One of "fashion", "lifestyle", "tech", "beauty", "sustainability"
    - confidence: 0-100 (how confident you are this is a real trend)
    - trendScore: 0-100 (trend strength/momentum)
    - changePercentage: -100 to +500 (growth rate)
    - impact: "high", "medium", or "low" (potential brand impact)
    
    Return as JSON array of trend objects. Only include trends with confidence > 70.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cultural trend analyst specializing in fashion and lifestyle brands. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.trends || [];
  } catch (error) {
    console.error("Failed to analyze trends:", error);
    throw new Error("Failed to analyze trends with AI");
  }
}

export async function generateBrandSuggestions(trends: AnalyzedTrend[]): Promise<BrandSuggestion[]> {
  try {
    const prompt = `
    Based on these cultural trends, generate 2-3 creative brand response suggestions for each trend.
    Focus on fashion/lifestyle brand opportunities.
    
    Trends: ${JSON.stringify(trends)}
    
    For each suggestion, provide:
    - title: Catchy, actionable suggestion name
    - description: 2-3 sentences explaining the opportunity and execution
    - impact: "high", "medium", "low" (business impact potential)
    - effort: "high", "medium", "low" (implementation difficulty)
    - type: "strategic" (long-term initiatives), "content" (marketing/content), "partnership" (collaborations), "quick-win" (fast implementation)
    
    Prioritize suggestions that are:
    - Actionable and specific
    - Relevant to fashion/lifestyle brands
    - Feasible to implement
    - Differentiated from competitors
    
    Return as JSON array of suggestion objects.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a brand strategist specializing in fashion and lifestyle. Generate creative, actionable brand opportunities. Respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];
  } catch (error) {
    console.error("Failed to generate brand suggestions:", error);
    throw new Error("Failed to generate brand suggestions with AI");
  }
}

export async function generateEmailSummary(trends: AnalyzedTrend[], suggestions: BrandSuggestion[]): Promise<string> {
  try {
    const topTrends = trends.slice(0, 3);
    const topSuggestions = suggestions.slice(0, 3);

    const prompt = `
    Create an engaging email summary for a daily cultural trends report.
    
    Top Trends: ${JSON.stringify(topTrends)}
    Top Suggestions: ${JSON.stringify(topSuggestions)}
    
    Write a brief, engaging summary (2-3 paragraphs) that:
    - Highlights the most important cultural shifts
    - Explains why these trends matter for fashion/lifestyle brands
    - Teases the brand opportunities included in the report
    - Maintains an expert but accessible tone
    
    Do not include HTML formatting - this will be converted to HTML later.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a cultural intelligence expert writing for fashion and lifestyle brand executives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Today's cultural trends analysis is complete.";
  } catch (error) {
    console.error("Failed to generate email summary:", error);
    return "Today's cultural trends analysis is complete. View the full report for detailed insights and brand opportunities.";
  }
}
