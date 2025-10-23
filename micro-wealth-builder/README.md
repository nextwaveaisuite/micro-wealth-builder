# 🚀 Micro Wealth Builder

An autonomous micro-investing web application that helps users build wealth through automated, rules-based portfolio allocation across Australian ETFs and micro-investing platforms.

![Micro Wealth Builder](https://img.shields.io/badge/React-18.3-blue) ![Vite](https://img.shields.io/badge/Vite-6.3-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## ✨ Features

- **Autonomous Investing Engine**: Rules-based asset scoring and allocation
- **Big 5 ETF Support**: VAS, VGS, IVV, VAF, GOLD
- **Micro-App Integration**: Raiz, Spaceship, CommSec Pocket
- **Risk Profiles**: Conservative, Balanced, Growth strategies
- **DCA Automation**: Weekly, fortnightly, or monthly contributions
- **Buy-the-Dip**: Automated extra contributions during market dips
- **Rebalancing Alerts**: Drift detection and rebalancing recommendations
- **Crash Simulator**: Visual demonstration of DCA benefits during downturns
- **Broker-Agnostic**: Export CSV or use deep links to any platform
- **20-Year Projections**: Compound growth calculator

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Supabase (optional)
- **Deployment**: Vercel

## 📦 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/micro-wealth-builder.git
cd micro-wealth-builder
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
# or
pnpm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

\`\`\`bash
npm run build
# or
pnpm run build
\`\`\`

## 🔧 Supabase Setup (Optional)

To enable user accounts and data persistence:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Create Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Create Database Tables

Run these SQL commands in your Supabase SQL editor:

\`\`\`sql
-- User Settings Table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_band TEXT NOT NULL DEFAULT 'balanced',
  contribution_amount NUMERIC NOT NULL DEFAULT 50,
  contribution_cadence TEXT NOT NULL DEFAULT 'weekly',
  buy_the_dip_enabled BOOLEAN DEFAULT true,
  buy_the_dip_extra NUMERIC DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Holdings Table
CREATE TABLE user_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  units NUMERIC NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Order History Table
CREATE TABLE order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  orders JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  dip_extra NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holdings" ON user_holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings" ON user_holdings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON order_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON order_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
\`\`\`

### 4. Install Supabase Client

\`\`\`bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
\`\`\`

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (if using Supabase):
   - \`VITE_SUPABASE_URL\`
   - \`VITE_SUPABASE_ANON_KEY\`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

\`\`\`bash
npm install -g vercel
vercel login
vercel
\`\`\`

## 📁 Project Structure

\`\`\`
micro-wealth-builder/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   ├── data/
│   │   ├── universe.json    # Asset universe data
│   │   └── rules.json       # Investment rules config
│   ├── lib/
│   │   ├── engine.js        # Investment engine logic
│   │   ├── deeplinks.js     # Platform integration
│   │   └── supabase.js      # Supabase client
│   ├── App.jsx              # Main application
│   ├── App.css              # Custom styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
\`\`\`

## 🎨 Customization

### Modify Asset Universe

Edit \`src/data/universe.json\` to add or remove ETFs and micro-investing platforms.

### Adjust Investment Rules

Edit \`src/data/rules.json\` to change:
- Risk band allocations
- Scoring weights
- Rebalancing thresholds
- Buy-the-dip triggers

### Update Platform Colors

Edit \`src/App.css\` to customize platform button colors:

\`\`\`css
.btn-raiz { @apply bg-purple-600 ... }
.btn-spaceship { @apply bg-blue-600 ... }
/* etc. */
\`\`\`

## 📊 How It Works

### Investment Engine

The app uses a **rules-based scoring system** to rank assets:

1. **Diversification**: Lower correlation with existing holdings
2. **Fees**: Lower management fees score higher
3. **Volatility**: Lower volatility for conservative profiles
4. **Drawdown**: Smaller historical drawdowns
5. **Income**: Higher dividend yields
6. **Quality**: Larger AUM (liquidity proxy)

### Order Generation

For each contribution:

1. Calculate current portfolio allocation
2. Compare to target allocation (based on risk profile)
3. Identify drift from target
4. Allocate new funds to rebalance toward target
5. Add buy-the-dip extra if market triggers hit
6. Distribute within growth/safety sleeves by asset scores

### Rebalancing

Rebalancing is triggered when:
- Drift exceeds threshold (5-7% depending on risk profile)
- OR time-based cadence reached (15 months)

## ⚠️ Compliance & Disclaimers

This tool provides **general educational information** and automated portfolio suggestions based on user-chosen settings. It is **not personal financial advice**.

Users are responsible for:
- Executing trades through their chosen broker
- Understanding investment risks
- Seeking advice from licensed financial advisers

Past performance does not guarantee future results.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
1. Check the [Issues](https://github.com/YOUR_USERNAME/micro-wealth-builder/issues) page
2. Create a new issue with detailed information
3. Include screenshots if relevant

## 🎯 Roadmap

- [ ] User authentication with Supabase
- [ ] Real-time ETF price feeds
- [ ] Broker API integration for one-click execution
- [ ] Holdings sync from broker exports
- [ ] Push notifications for contributions and rebalancing
- [ ] Historical performance tracking
- [ ] Tax reporting features
- [ ] Mobile app (React Native or Flutter)

---

**Built with ❤️ for micro-investors in Australia**

