// Wealth Builder Phase 2 - Complete Deployment Guide

# Wealth Builder Phase 2 Deployment Guide

This guide walks you through deploying Phase 2 of Wealth Builder with all new features: live data, holdings import, Stripe billing, telemetry, and admin console.

---

## Prerequisites

- ✅ GitHub account with your repositories
- ✅ Vercel account (connected to GitHub)
- ✅ Supabase account (free tier is sufficient)
- ✅ Stripe account (test mode for development, live mode for production)
- ✅ Node.js 20.x installed locally (for testing)

---

## Part 1: Supabase Setup (15 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `wealth-builder`
   - **Database Password**: Generate and save securely
   - **Region**: Sydney (closest to Australian users)
4. Wait ~2 minutes for project creation

### 1.2 Run Database Schema

1. Open **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy entire contents of `supabase-schema.sql`
4. Paste and click **"Run"**
5. Verify: Go to **Table Editor** and confirm all 7 tables exist

### 1.3 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Part 2: Stripe Setup (10 minutes)

### 2.1 Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete business verification (can use test mode immediately)

### 2.2 Create Product & Price

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name**: Wealth Builder Pro
   - **Description**: Advanced features including live data, holdings import, Loss Guard alerts
   - **Pricing**: Recurring, $12 AUD/month
   - **Trial period**: 14 days (optional)
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_...`)

### 2.3 Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key**: `pk_test_...` (for test mode)
   - **Secret key**: `sk_test_...` (for test mode)

### 2.4 Set Up Webhook (After Vercel Deployment)

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.vercel.app/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_...`)

---

## Part 3: Deploy User App (micro-wealth-builder)

### 3.1 Update Your Repository

1. Copy all files from `phase2-files/` to your `micro-wealth-builder/` directory
2. Update `package.json` with new dependencies:

```bash
cd micro-wealth-builder
npm install @supabase/supabase-js@^2.39.0 stripe@^14.10.0
```

3. Commit and push:

```bash
git add .
git commit -m "Phase 2: Add live data, holdings, billing, telemetry"
git push origin main
```

### 3.2 Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add these variables (for Production, Preview, Development):

```bash
# Supabase (Frontend)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase (Backend - Service Key)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (⚠️ Keep secret!)

# Stripe
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (add after webhook setup)

# Admin
ADMIN_TOKEN=generate-a-secure-random-token-here
```

4. Click **"Save"**

### 3.3 Trigger Deployment

Vercel should auto-deploy on push. If not:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment

### 3.4 Verify Deployment

1. Visit your deployed URL
2. Test:
   - ✅ Sign up for new account
   - ✅ View live quotes on Portfolio page
   - ✅ Navigate to Billing page
   - ✅ Check Holdings page (Pro feature)

---

## Part 4: Deploy Admin App (micro-wealth-admin)

### 4.1 Update Admin Repository

1. Copy admin files from `phase2-files/admin/` to your `micro-wealth-admin/` directory
2. Update dependencies:

```bash
cd micro-wealth-admin
npm install @supabase/supabase-js@^2.39.0
```

3. Commit and push:

```bash
git add .
git commit -m "Phase 2: Add stats dashboard and config management"
git push origin main
```

### 4.2 Configure Admin Environment Variables

In your admin Vercel project:

```bash
# Supabase (Backend only)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Admin Authentication
ADMIN_TOKEN=same-token-as-user-app
```

### 4.3 Access Admin Console

1. Visit `https://your-admin-domain.vercel.app`
2. Log in with your admin token
3. Verify:
   - ✅ Overview shows user stats
   - ✅ Settings page loads config
   - ✅ Can edit and save config

---

## Part 5: Testing Checklist

### User App Testing

- [ ] **Authentication**
  - [ ] Sign up with email/password
  - [ ] Sign in
  - [ ] Sign out
  - [ ] Password reset

- [ ] **Live Data**
  - [ ] Portfolio page shows live quotes
  - [ ] Quotes update every 15 minutes
  - [ ] Charts display correctly

- [ ] **Holdings Import** (Pro only)
  - [ ] Upload CSV file
  - [ ] Paste CSV text
  - [ ] Holdings display correctly
  - [ ] Can clear holdings

- [ ] **Billing**
  - [ ] Checkout flow works
  - [ ] Redirects to Stripe
  - [ ] Returns after payment
  - [ ] Pro status updates
  - [ ] Billing portal accessible

- [ ] **Loss Guard & Radar**
  - [ ] Alerts display when triggered
  - [ ] Can dismiss alerts
  - [ ] Recommendations are clear

### Admin App Testing

- [ ] **Authentication**
  - [ ] Admin login works
  - [ ] Unauthorized access blocked

- [ ] **Dashboard**
  - [ ] User stats display
  - [ ] Telemetry events show
  - [ ] Loss Guard events show

- [ ] **Settings**
  - [ ] Can view config
  - [ ] Can edit values
  - [ ] Changes save successfully

---

## Part 6: Stripe Webhook Verification

After deploying to Vercel:

1. Go to Stripe **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select `customer.subscription.created`
5. Verify: Check Vercel logs for successful webhook processing

---

## Part 7: Going Live (Production)

### 7.1 Switch Stripe to Live Mode

1. In Stripe dashboard, toggle to **Live mode**
2. Create new product/price (same as test)
3. Update Vercel environment variables:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PRICE_ID=price_...` (live price ID)
4. Update webhook endpoint to live mode
5. Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

### 7.2 Enable Supabase Email Confirmation

1. Go to Supabase **Authentication** → **Email Templates**
2. Customize confirmation email
3. Set up SMTP (or use Supabase default)

### 7.3 Monitor & Optimize

- Set up Vercel Analytics
- Monitor Supabase usage
- Check Stripe dashboard for subscriptions
- Review admin console regularly

---

## Troubleshooting

### Issue: "Supabase not configured" error

**Solution**: 
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- Redeploy after adding environment variables

### Issue: Quotes API returns errors

**Solution**:
- Check Yahoo Finance is accessible
- Verify no rate limiting
- Check Vercel function logs

### Issue: Stripe webhook not working

**Solution**:
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Test webhook using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe-webhook`

### Issue: Admin can't log in

**Solution**:
- Verify `ADMIN_TOKEN` matches in both apps
- Check cookies are enabled
- Try clearing browser cache

### Issue: Holdings import fails

**Solution**:
- Verify CSV format matches template
- Check Supabase `user_holdings` table exists
- Verify user is authenticated and has Pro status

---

## Environment Variables Reference

### User App (micro-wealth-builder)

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `VITE_SUPABASE_URL` | Public | `https://xxx.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Public | `eyJhbGc...` | Yes |
| `SUPABASE_URL` | Secret | `https://xxx.supabase.co` | Yes |
| `SUPABASE_SERVICE_KEY` | Secret | `eyJhbGc...` | Yes |
| `STRIPE_SECRET_KEY` | Secret | `sk_test_...` | Yes |
| `STRIPE_PRICE_ID` | Secret | `price_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | Secret | `whsec_...` | Yes |
| `ADMIN_TOKEN` | Secret | Random string | Yes |

### Admin App (micro-wealth-admin)

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `SUPABASE_URL` | Secret | `https://xxx.supabase.co` | Yes |
| `SUPABASE_SERVICE_KEY` | Secret | `eyJhbGc...` | Yes |
| `ADMIN_TOKEN` | Secret | Same as user app | Yes |

---

## Security Best Practices

1. ✅ **Never commit secrets** to Git (use `.env.local` locally)
2. ✅ **Use different tokens** for test and production
3. ✅ **Rotate admin token** periodically
4. ✅ **Enable Supabase RLS** (already configured in schema)
5. ✅ **Monitor Stripe webhooks** for suspicious activity
6. ✅ **Use HTTPS only** (Vercel provides this automatically)
7. ✅ **Review Vercel logs** regularly for errors

---

## Support & Maintenance

### Regular Tasks

- **Weekly**: Check admin dashboard for anomalies
- **Monthly**: Review Stripe subscriptions and failed payments
- **Quarterly**: Update dependencies (`npm update`)
- **As needed**: Adjust Loss Guard/Radar config based on user feedback

### Monitoring

- Vercel: Function execution times and errors
- Supabase: Database size and API requests
- Stripe: MRR, churn rate, failed payments
- Admin Console: User growth, telemetry events

---

## Phase 2 Complete! 🎉

You now have:
- ✅ Live ETF quotes with caching
- ✅ Holdings CSV import
- ✅ Stripe billing with Pro tier
- ✅ Loss Guard & Radar v2
- ✅ Telemetry & analytics
- ✅ Admin console with config management

**Next Steps**: Monitor user adoption, gather feedback, and plan Phase 3 features (tax reporting, mobile app, API access).

---

**Questions?** Review the code comments or check Vercel/Supabase/Stripe documentation.

