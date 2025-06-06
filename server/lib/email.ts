import nodemailer from 'nodemailer';
import type { Trend, AISuggestion } from '@shared/schema';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export async function createEmailTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || '';
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || '';

  if (!emailUser || !emailPassword) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
  }

  const transporter = nodemailer.createTransporter({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  // Verify the connection
  await transporter.verify();
  return transporter;
}

export function generateEmailTemplate(
  trends: Trend[], 
  suggestions: AISuggestion[], 
  summary: string,
  date: string
): EmailTemplate {
  const topTrends = trends.slice(0, 3);
  const topSuggestions = suggestions.slice(0, 3);

  const subject = `🔥 Daily Cultural Trends Report - ${date}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrendScope Daily Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .summary { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary p { margin: 0; font-size: 16px; line-height: 1.6; }
        .section { margin-bottom: 40px; }
        .section h2 { font-size: 20px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; }
        .section h2 .emoji { margin-right: 8px; }
        .trend-item, .suggestion-item { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
        .trend-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .trend-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }
        .trend-score { font-size: 14px; color: #64748b; }
        .trend-description { font-size: 14px; color: #475569; margin-bottom: 15px; }
        .trend-sources { display: flex; flex-wrap: gap; gap: 8px; }
        .source-tag { background-color: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .suggestion-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .suggestion-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }
        .impact-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
        .impact-high { background-color: #dcfce7; color: #166534; }
        .impact-medium { background-color: #fef3c7; color: #92400e; }
        .impact-low { background-color: #e0f2fe; color: #0369a1; }
        .suggestion-description { font-size: 14px; color: #475569; margin-bottom: 10px; }
        .suggestion-meta { font-size: 12px; color: #64748b; }
        .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
        .footer a { color: #2563eb; text-decoration: none; }
        .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TrendScope Daily Report</h1>
            <p>Your AI-powered cultural intelligence briefing for ${date}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <p>${summary}</p>
            </div>
            
            <div class="section">
                <h2><span class="emoji">🔥</span>Top Cultural Trends</h2>
                ${topTrends.map((trend, index) => `
                    <div class="trend-item">
                        <div class="trend-header">
                            <h3 class="trend-title">${index + 1}. ${trend.title}</h3>
                            <div class="trend-score">Score: ${trend.trendScore}/100</div>
                        </div>
                        <p class="trend-description">${trend.description}</p>
                        <div class="trend-sources">
                            ${JSON.parse(JSON.stringify(trend.sources)).map((source: any) => 
                                `<span class="source-tag">${source.platform}: ${source.mentions}</span>`
                            ).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2><span class="emoji">💡</span>AI-Generated Brand Opportunities</h2>
                ${topSuggestions.map(suggestion => `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <h3 class="suggestion-title">${suggestion.title}</h3>
                            <span class="impact-badge impact-${suggestion.impact}">${suggestion.impact} Impact</span>
                        </div>
                        <p class="suggestion-description">${suggestion.description}</p>
                        <div class="suggestion-meta">
                            Type: ${suggestion.type} • Effort: ${suggestion.effort}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Powered by TrendScope AI</p>
            <p><a href="#">View Full Dashboard</a> • <a href="#">Update Preferences</a></p>
            <p>Want to change your settings? <a href="#">Manage subscription</a></p>
        </div>
    </div>
</body>
</html>
  `;

  const text = `
TrendScope Daily Report - ${date}

${summary}

TOP CULTURAL TRENDS:
${topTrends.map((trend, index) => `
${index + 1}. ${trend.title} (Score: ${trend.trendScore}/100)
${trend.description}
`).join('')}

AI-GENERATED BRAND OPPORTUNITIES:
${topSuggestions.map(suggestion => `
• ${suggestion.title} (${suggestion.impact} impact, ${suggestion.effort} effort)
  ${suggestion.description}
`).join('')}

--
Powered by TrendScope AI
View full dashboard or update preferences at your dashboard.
  `;

  return { subject, html, text };
}

export async function sendEmail(
  recipients: EmailRecipient[],
  template: EmailTemplate
): Promise<void> {
  const transporter = await createEmailTransporter();

  const emailPromises = recipients.map(async (recipient) => {
    try {
      await transporter.sendMail({
        from: `"TrendScope" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: template.subject,
        text: template.text,
        html: template.html
      });
      console.log(`Email sent successfully to ${recipient.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      throw error;
    }
  });

  await Promise.all(emailPromises);
}

export async function sendTrendReport(
  trends: Trend[],
  suggestions: AISuggestion[],
  summary: string,
  recipients: EmailRecipient[]
): Promise<number> {
  try {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const template = generateEmailTemplate(trends, suggestions, summary, date);
    await sendEmail(recipients, template);
    
    console.log(`Trend report sent successfully to ${recipients.length} recipients`);
    return recipients.length;
  } catch (error) {
    console.error('Failed to send trend report:', error);
    throw error;
  }
}
