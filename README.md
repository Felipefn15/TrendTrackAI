# TrendScope 🔥

An AI-powered cultural trends monitoring tool that automatically scrapes web sources daily and delivers strategic brand insights via email every morning.

![TrendScope Dashboard](https://via.placeholder.com/800x400/2196F3/ffffff?text=TrendScope+Dashboard)

## 🌟 Features

### 📊 **Real-time Cultural Intelligence**
- **Multi-platform Data Collection**: Automatically scrapes Reddit, Google Trends, TikTok, Twitter/X, and fashion blogs
- **AI-Powered Analysis**: Uses OpenAI GPT-4o to identify meaningful cultural trends and assess their brand relevance
- **Trend Scoring**: Sophisticated confidence and momentum scoring for each detected trend
- **Category Classification**: Automatically categorizes trends (fashion, lifestyle, tech, beauty, sustainability)

### 🤖 **Smart Brand Strategy**
- **AI Suggestions**: Generates 2-3 actionable brand response ideas for each trend
- **Impact Assessment**: Evaluates potential business impact (high/medium/low) and implementation effort
- **Strategy Types**: Categorizes suggestions as strategic, content, partnership, or quick-win opportunities
- **Export Capabilities**: Download individual suggestions as formatted documents

### 📧 **Automated Reporting**
- **Daily Email Reports**: Beautiful HTML email templates sent automatically every morning
- **Customizable Recipients**: Configure multiple email recipients with easy management
- **Email Previews**: Preview reports before sending with live data
- **Test Email Function**: Send test emails to verify configuration

### ⚙️ **Flexible Configuration**
- **Scheduling Control**: Customize data collection intervals (hourly to daily)
- **Brand Targeting**: Configure brand category, target audience, and focus keywords
- **Source Management**: Enable/disable individual data sources and monitor their status
- **Real-time Monitoring**: Live status indicators for all scraping sources

### 📈 **Analytics Dashboard**
- **Visual Trend Cards**: Interactive cards showing trend details, confidence scores, and source attribution
- **Status Overview**: Real-time analytics on trends identified, sources monitored, and reports sent
- **Source Health**: Monitor scraping success rates and error messages
- **Historical Reports**: Access past reports and download archived data

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript for modern component-based UI
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with shadcn/ui for beautiful, accessible components
- **Lucide React** for consistent iconography

### **Backend**
- **Node.js** with Express.js for robust API server
- **TypeScript** for type-safe server-side development
- **Drizzle ORM** with PostgreSQL schema (in-memory storage for development)
- **OpenAI GPT-4o** for advanced trend analysis and content generation
- **Nodemailer** for reliable email delivery

### **Data Collection**
- **Web Scraping**: Custom scrapers for each platform with rate limiting
- **Cheerio** for HTML parsing and content extraction
- **Fetch API** for HTTP requests with proper error handling
- **Cron Scheduling** for automated background tasks

### **Development Tools**
- **ESBuild** for fast TypeScript compilation
- **Zod** for runtime type validation
- **React Hook Form** with validation for form management
- **shadcn/ui** component library for consistent design system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- (Optional) Twitter API credentials for enhanced social media data
- (Optional) Email service credentials (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trendscope.git
   cd trendscope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional - Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # Optional - Twitter/X API (for enhanced social data)
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   
   # Optional - Database (defaults to in-memory storage)
   DATABASE_URL=postgresql://user:password@localhost:5432/trendscope
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000` to access the TrendScope dashboard.

### 🔑 Getting API Keys

#### OpenAI API Key (Required)
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `OPENAI_API_KEY`

#### Twitter API (Optional - for enhanced social data)
1. Apply for Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new project/app
3. Generate Bearer Token
4. Add it to your `.env` file as `TWITTER_BEARER_TOKEN`

#### Gmail App Password (Optional - for email reports)
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings > Security > App Passwords
3. Generate a new app password for "Mail"
4. Use your Gmail address as `EMAIL_USER` and the app password as `EMAIL_PASSWORD`

## 📋 Usage Guide

### Initial Setup
1. **Configure Email Recipients**: Go to Settings → Email Configuration
2. **Set Brand Preferences**: Configure your brand category and target keywords
3. **Enable Data Sources**: Visit Sources page to enable/disable scrapers
4. **Test Email**: Send a test email to verify configuration

### Daily Workflow
1. **Morning Reports**: Automatically receive trend insights via email at 6 AM
2. **Dashboard Review**: Check the dashboard for real-time trend updates
3. **Export Suggestions**: Download actionable brand strategies as needed
4. **Source Monitoring**: Monitor scraping health and address any issues

### Manual Operations
- **Generate Report**: Create and send reports manually anytime
- **Refresh Data**: Trigger immediate data collection from all sources
- **Preview Emails**: Review email content before sending
- **Export Data**: Download trends and suggestions for external analysis

## 🔧 Configuration

### Scheduling
- **Data Collection**: Configure frequency from hourly to daily intervals
- **Email Reports**: Set custom time for daily report delivery
- **Source Management**: Enable/disable individual scrapers

### Brand Targeting
- **Categories**: Fashion, Beauty, Food, Tech, Entertainment
- **Keywords**: Custom focus keywords for relevant trend filtering
- **Audience**: Target demographic specification for AI analysis

### Email Settings
- **Recipients**: Multiple email addresses supported
- **Templates**: Professional HTML email templates
- **Testing**: Built-in test email functionality

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/yourusername/trendscope/wiki) for detailed guides
- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/trendscope/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/trendscope/discussions)

## 🙏 Acknowledgments

- OpenAI for powerful GPT-4o integration
- The React and Node.js communities for excellent tooling
- shadcn/ui for beautiful, accessible components
- All the social platforms that provide public APIs

---

**Built with ❤️ by developers who believe in the power of cultural intelligence for brand strategy.**