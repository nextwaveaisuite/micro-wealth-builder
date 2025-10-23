# Wealth Builder Phase 2 - Integration Checklist

This checklist helps you integrate Phase 2 files into your existing codebase systematically.

---

## Step 1: Install New Dependencies

```bash
cd micro-wealth-builder
npm install @supabase/supabase-js@^2.39.0 stripe@^14.10.0
```

---

## Step 2: Add New Files

### Core Infrastructure

- [ ] `src/lib/supabase.js` - Supabase client configuration
- [ ] `src/contexts/AuthContext.jsx` - Authentication context provider
- [ ] `src/hooks/useQuotes.js` - Live quotes hook
- [ ] `src/hooks/useTelemetry.js` - Telemetry tracking hook

### Business Logic

- [ ] `src/lib/lossGuard.js` - Loss Guard calculations
- [ ] `src/lib/radar.js` - Radar v2 tilt calculations

### Pages

- [ ] `src/pages/Auth.jsx` - Login/signup page
- [ ] `src/pages/Holdings.jsx` - Holdings import page
- [ ] `src/pages/Billing.jsx` - Subscription management page

### Components

- [ ] `src/components/AlertBanner.jsx` - Alert display component

### API Endpoints (Serverless Functions)

- [ ] `api/quotes.js` - Live ETF quotes
- [ ] `api/holdings.js` - Holdings CRUD
- [ ] `api/checkout.js` - Stripe checkout
- [ ] `api/portal.js` - Stripe billing portal
- [ ] `api/stripe-webhook.js` - Stripe webhook handler
- [ ] `api/telemetry.js` - Telemetry collection

### Configuration

- [ ] `.env.example` - Environment variables template
- [ ] `package.json` - Updated with new dependencies

---

## Step 3: Update Existing Files

### 3.1 Update `main.jsx`

Wrap your app with `AuthProvider`:

```jsx
import { AuthProvider } from './contexts/AuthContext'

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

### 3.2 Update `App.jsx` (or Router)

Add new routes:

```jsx
import Auth from './pages/Auth'
import Holdings from './pages/Holdings'
import Billing from './pages/Billing'

// In your router:
<Route path="/auth" element={<Auth />} />
<Route path="/holdings" element={<Holdings />} />
<Route path="/billing" element={<Billing />} />
```

### 3.3 Update `Overview.jsx`

Add live quotes and telemetry:

```jsx
import { useQuotes } from '../hooks/useQuotes'
import { useTelemetry, TelemetryEvents } from '../hooks/useTelemetry'
import { AlertBanner } from '../components/AlertBanner'
import { runLossGuard } from '../lib/lossGuard'

export default function Overview() {
  const { quotes, loading } = useQuotes()
  const { track } = useTelemetry()
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    track(TelemetryEvents.PAGE_VIEW, { page: 'overview' })
  }, [])

  // Use quotes data instead of demo data
  // ...
}
```

### 3.4 Update `Portfolio.jsx`

Replace demo data with live quotes:

```jsx
import { useQuotes } from '../hooks/useQuotes'

export default function Portfolio() {
  const { quotes, loading, error } = useQuotes()

  // Map quotes to your existing chart format
  const series = quotes.map(q => ({
    name: q.ticker,
    data: q.series || [], // Historical data
    color: getColorForTicker(q.ticker)
  }))

  // Rest of your component...
}
```

### 3.5 Update `Layout.jsx`

Add user menu with auth status:

```jsx
import { useAuth } from '../contexts/AuthContext'

export function Layout({ children, title, menu }) {
  const { user, isPro, signOut } = useAuth()

  return (
    <div>
      <header>
        {/* Your existing header */}
        {user ? (
          <div>
            <span>{user.email}</span>
            {isPro && <span className="badge blue">PRO</span>}
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <a href="/auth">Sign In</a>
        )}
      </header>
      {/* Rest of layout */}
    </div>
  )
}
```

---

## Step 4: Admin App Integration

### 4.1 Add Admin Files

- [ ] `admin/src/pages/Overview.jsx` - Stats dashboard
- [ ] `admin/src/pages/Settings.jsx` - Config management
- [ ] `admin/api/admin/stats.js` - Stats API
- [ ] `admin/api/admin/config.js` - Config API

### 4.2 Update Admin Router

```jsx
<Route path="/" element={<Overview />} />
<Route path="/settings" element={<Settings />} />
```

---

## Step 5: Environment Variables

### 5.1 Local Development

Create `.env.local` in `micro-wealth-builder/`:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_TOKEN=your-secure-token
```

### 5.2 Vercel Production

Add all variables in Vercel dashboard:
- Go to **Settings** → **Environment Variables**
- Add each variable for Production, Preview, Development

---

## Step 6: Database Setup

- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verify all 7 tables created
- [ ] Check RLS policies are enabled
- [ ] Test authentication trigger (sign up a test user)

---

## Step 7: Stripe Setup

- [ ] Create product in Stripe
- [ ] Copy Price ID
- [ ] Set up webhook endpoint (after deployment)
- [ ] Test checkout flow
- [ ] Verify webhook receives events

---

## Step 8: Testing

### Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Password reset works

### Live Data
- [ ] Quotes API returns data
- [ ] Charts display live data
- [ ] Quotes cache for 15 minutes

### Holdings (Pro)
- [ ] CSV upload works
- [ ] CSV paste works
- [ ] Holdings display correctly
- [ ] Can clear holdings

### Billing
- [ ] Checkout redirects to Stripe
- [ ] Payment success updates Pro status
- [ ] Billing portal accessible
- [ ] Subscription cancellation works

### Loss Guard
- [ ] Weekly brake calculates correctly
- [ ] Safety floor detects breaches
- [ ] Growth cap triggers
- [ ] Alerts display

### Radar
- [ ] Macro stress calculates
- [ ] Tilts recommend correctly
- [ ] BTD toggle works
- [ ] Monthly cap enforced

### Telemetry
- [ ] Events send to API
- [ ] Batching works
- [ ] Admin can view events

### Admin Console
- [ ] Login works
- [ ] Stats display
- [ ] Config editable
- [ ] Changes save

---

## Step 9: Deployment

- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Environment variables set
- [ ] Test production deployment
- [ ] Verify Stripe webhook

---

## Step 10: Post-Deployment

- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase usage
- [ ] Review Stripe dashboard
- [ ] Test user signup flow end-to-end
- [ ] Verify Pro upgrade works
- [ ] Check admin console access

---

## Common Integration Issues

### Issue: Import errors for new files

**Solution**: Ensure file paths match your project structure. Adjust imports if your structure differs.

### Issue: Supabase client undefined

**Solution**: 
1. Check environment variables are set
2. Restart dev server after adding `.env.local`
3. Verify `VITE_` prefix for frontend variables

### Issue: API routes not found

**Solution**:
1. Ensure `api/` folder is at root of project (same level as `src/`)
2. Check `vercel.json` is configured correctly
3. Redeploy to Vercel

### Issue: Stripe webhook fails

**Solution**:
1. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5173/api/stripe-webhook`
2. Verify webhook secret matches
3. Check raw body parsing is disabled

### Issue: Admin can't access console

**Solution**:
1. Verify `ADMIN_TOKEN` matches in both apps
2. Check cookie is being set
3. Try using header: `X-Admin-Token: your-token`

---

## Verification Commands

```bash
# Check dependencies installed
npm list @supabase/supabase-js stripe

# Test local dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Phase 2 Integration Complete! ✅

Your app now has:
- ✅ Live data integration
- ✅ User authentication
- ✅ Pro subscription billing
- ✅ Holdings import
- ✅ Loss Guard & Radar
- ✅ Telemetry tracking
- ✅ Admin console

**Ready for production deployment!**

