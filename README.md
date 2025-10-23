# Wealth Builder Phase 2 - Complete Package

**Ready for GitHub + Vercel + Supabase deployment**

---

## 📦 What's Inside

This package contains your complete Wealth Builder application with all Phase 2 features integrated:

```
final-package/
├── micro-wealth-builder/          # User-facing app
│   ├── api/                       # Serverless functions (6 endpoints)
│   ├── src/                       # React app with Phase 2 features
│   └── package.json               # Updated with Supabase + Stripe
│
├── micro-wealth-admin/            # Admin console
│   ├── api/admin/                 # Admin API endpoints
│   ├── src/                       # Admin dashboard
│   └── package.json               # Updated with Supabase
│
└── Documentation/
    ├── QUICK_START.md             # 5-minute setup guide
    ├── DEPLOYMENT_GUIDE.md        # Complete deployment steps
    ├── DELIVERY_CHECKLIST.md      # Pre-launch checklist
    ├── INTEGRATION_CHECKLIST.md   # Integration verification
    ├── SUPABASE_SETUP.sql         # Database schema
    └── .env.example               # Environment variables template
```

---

## 🚀 Quick Deploy (30 Minutes)

### Step 1: Supabase Setup (10 min)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Name: `wealth-builder`, Region: Sydney
3. Open **SQL Editor** → Run `SUPABASE_SETUP.sql`
4. Go to **Settings** → **API** → Copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret!)

### Step 2: Stripe Setup (5 min)

1. Go to [stripe.com](https://stripe.com) → Sign up
2. **Products** → Create product:
   - Name: Wealth Builder Pro
   - Price: $12 AUD/month recurring
   - Trial: 14 days
3. Copy **Price ID** (starts with `price_...`)
4. **Developers** → **API keys** → Copy:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

### Step 3: GitHub Push (5 min)

```bash
# User App
cd micro-wealth-builder
git init
git add .
git commit -m "Phase 2: Complete implementation"
git remote add origin https://github.com/YOUR-USERNAME/micro-wealth-builder.git
git push -u origin main

# Admin App
cd ../micro-wealth-admin
git init
git add .
git commit -m "Phase 2: Admin console"
git remote add origin https://github.com/YOUR-USERNAME/micro-wealth-admin.git
git push -u origin main
```

### Step 4: Vercel Deploy (10 min)

**User App:**
1. Go to [vercel.com](https://vercel.com) → Import from GitHub
2. Select `micro-wealth-builder` repository
3. **Environment Variables** → Add:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... (secret!)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   ADMIN_TOKEN=your-secure-random-token
   ```
4. Deploy!

**Admin App:**
1. Import `micro-wealth-admin` repository
2. **Environment Variables** → Add:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ADMIN_TOKEN=same-token-as-user-app
   ```
3. Deploy!

### Step 5: Stripe Webhook (5 min)

1. After Vercel deployment completes, copy your user app URL
2. Stripe → **Developers** → **Webhooks** → Add endpoint
3. URL: `https://your-app.vercel.app/api/stripe-webhook`
4. Events: Select all `customer.subscription.*` and `invoice.*`
5. Copy **Signing secret** (`whsec_...`)
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
7. Redeploy

---

## ✅ Verify Deployment

1. **User App**: Visit your Vercel URL
   - Sign up for account
   - View Portfolio (should show demo data)
   - Go to Billing → Start trial
   - After payment, verify Pro badge appears

2. **Admin App**: Visit admin Vercel URL
   - Login with your `ADMIN_TOKEN`
   - Verify dashboard shows stats
   - Check Settings page loads config

---

## 📁 File Structure

### User App (`micro-wealth-builder`)

**New Phase 2 Files:**
```
api/
├── quotes.js              # Live ETF quotes from Yahoo Finance
├── holdings.js            # CSV import/export
├── checkout.js            # Stripe checkout session
├── portal.js              # Stripe billing portal
├── stripe-webhook.js      # Subscription sync
└── telemetry.js           # Analytics tracking

src/
├── lib/
│   ├── supabase.js        # Database client
│   ├── lossGuard.js       # Portfolio protection
│   └── radar.js           # Macro stress analysis
├── contexts/
│   └── AuthContext.jsx    # Authentication provider
├── hooks/
│   ├── useQuotes.js       # Live data hook
│   └── useTelemetry.js    # Analytics hook
├── components/
│   └── AlertBanner.jsx    # Loss Guard alerts
└── pages/
    ├── Auth.jsx           # Login/signup
    ├── Holdings.jsx       # CSV import
    └── Billing.jsx        # Subscription management
```

**Your Existing Files** (preserved):
- All shadcn/ui components
- Your existing pages and layouts
- Your styling and assets

### Admin App (`micro-wealth-admin`)

**New Phase 2 Files:**
```
api/admin/
├── stats.js               # Dashboard analytics
└── config.js              # System configuration

src/pages/
├── Overview.jsx           # Stats dashboard
└── Settings.jsx           # Config management
```

---

## 🔧 Environment Variables Reference

### User App (Required)

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API |
| `SUPABASE_URL` | Same as above | Same |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Supabase → Settings → API (secret!) |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe → Developers → API keys |
| `STRIPE_PRICE_ID` | `price_...` | Stripe → Products → Your product |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe → Webhooks → Your endpoint |
| `ADMIN_TOKEN` | Any secure random string | Generate yourself |

### Admin App (Required)

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Same as user app |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Same as user app |
| `ADMIN_TOKEN` | Same as user app | Same as user app |

---

## 🎯 Phase 2 Features

### ✅ Implemented

- **Live ETF Quotes**: Real ASX data via Yahoo Finance, cached 15min
- **Holdings Import**: CSV upload from CommSec, SelfWealth, Pearler, Raiz
- **Stripe Billing**: Pro subscription ($12/month, 14-day trial)
- **Loss Guard v2**: Weekly brake, safety floor, growth cap alerts
- **Radar v2**: Macro stress monitoring, BTD tilts
- **Telemetry**: Anonymous usage tracking
- **Admin Console**: Dashboard, config management, user stats
- **Authentication**: Supabase Auth with email/password

### 🔒 Security

- Row Level Security on all Supabase tables
- Token-based admin authentication
- Stripe webhook signature verification
- Service keys never exposed to frontend
- HTTPS enforced by Vercel

---

## 📊 Tech Stack

- **Frontend**: React 18 + Vite + shadcn/ui
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Hosting**: Vercel
- **Version Control**: GitHub

---

## 🐛 Troubleshooting

### "Supabase not configured"
- Check environment variables in Vercel
- Ensure `VITE_` prefix for frontend variables
- Redeploy after adding variables

### Quotes API fails
- Verify Yahoo Finance is accessible
- Check Vercel function logs
- Ensure no rate limiting

### Stripe webhook not working
- Verify webhook URL matches Vercel deployment
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Test with Stripe CLI: `stripe listen --forward-to localhost:5173/api/stripe-webhook`

### Admin can't login
- Verify `ADMIN_TOKEN` matches in both apps
- Check browser cookies are enabled
- Try clearing localStorage

---

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup guide
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **DELIVERY_CHECKLIST.md** - Pre-launch verification
- **INTEGRATION_CHECKLIST.md** - Feature integration steps

---

## 🚦 Next Steps

1. **Deploy** following steps above
2. **Test** all features end-to-end
3. **Monitor** Vercel logs for errors
4. **Launch** to beta users
5. **Iterate** based on feedback

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## ✅ Phase 2 Complete!

Your Wealth Builder application is now production-ready with:
- ✅ Live data integration
- ✅ User authentication
- ✅ Pro subscription billing
- ✅ Holdings import
- ✅ Loss Guard & Radar
- ✅ Telemetry tracking
- ✅ Admin console

**Ready to deploy to GitHub + Vercel + Supabase!**

---

© 2025 Wealth Builder - Built for Australian micro-investors

