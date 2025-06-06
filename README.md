# TrendScope - AI-Powered Cultural Trends Monitor

An intelligent tool that monitors cultural trends across multiple platforms and delivers AI-powered brand strategy insights via automated email reports.

## Features

- **Multi-Platform Monitoring**: Scrapes Reddit, TikTok, Google Trends, Twitter, and fashion blogs
- **AI Analysis**: Uses OpenAI GPT-4o to analyze trends and generate brand strategy suggestions
- **Automated Reporting**: Daily email reports with trend summaries and actionable insights
- **Real-time Dashboard**: Monitor trends, sources, and system status
- **Scheduling System**: Automated scraping every 2 hours, reports sent daily at 6 AM

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add your OpenAI API key as an environment variable:
   - `OPENAI_API_KEY`: Your OpenAI API key
3. Deploy - Vercel will automatically detect the configuration

### Environment Variables

- `OPENAI_API_KEY`: Required for AI analysis and trend generation
- `NODE_ENV`: Set to "production" for deployed environments

## Architecture

- **Frontend**: React with Vite, TailwindCSS, and shadcn/ui components
- **Backend**: Node.js serverless functions on Vercel
- **AI**: OpenAI GPT-4o for trend analysis and brand suggestions
- **Storage**: In-memory storage (suitable for MVP/demo)
- **Scheduling**: Node-cron for automated tasks

## API Endpoints

- `GET /api/dashboard` - Dashboard data (trends, suggestions, sources, analytics)
- `GET /api/sources` - All monitoring sources
- `GET /api/settings` - Application settings
- `GET /api/reports` - Generated reports
- `GET /api/scheduler/status` - Scheduler status

## Local Development

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5000`