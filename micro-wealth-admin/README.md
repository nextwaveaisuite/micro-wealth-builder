# 🛡️ Micro Wealth Builder - Admin Console

Separate admin dashboard for managing the Micro Wealth Builder platform.

## Features

- **User Management**: View all registered users and their settings
- **Analytics Dashboard**: Track platform usage and popular assets
- **Order Monitoring**: See recent order activity across all users
- **System Logs**: Audit trail of admin actions
- **Real-time Stats**: Total users, portfolio values, averages

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Use the SAME Supabase project as the main app.

### 3. Create Admin User Table

Run this SQL in Supabase:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- System Logs Table
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admins can view logs" ON system_logs
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);
```

### 4. Add Your Admin Account

After creating your account in the main app, run this SQL:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('your_user_id_here', 'your_email@example.com');
```

Get your `user_id` from Supabase Authentication tab.

## Development

```bash
pnpm run dev
```

Open http://localhost:5173

## Deploy to Vercel

1. Push to GitHub (separate repo from main app)
2. Import to Vercel
3. Add environment variables
4. Deploy

**Recommended**: Deploy to a subdomain like `admin.yourapp.com`

## Security

- ✅ Separate authentication from main app
- ✅ Admin-only access via `admin_users` table
- ✅ Row Level Security enabled
- ✅ Audit logging for all actions
- ⚠️ Keep this repo PRIVATE
- ⚠️ Use strong passwords
- ⚠️ Enable 2FA on admin accounts

## Access Control

Only users listed in the `admin_users` table can log in. Regular users from the main app cannot access the admin console.

## Features Overview

### Dashboard
- Total users count
- Total portfolio value across all users
- Average portfolio size

### User Management
- View all users
- See risk profiles and contribution settings
- Check buy-the-dip status
- View user details

### Analytics
- Bar chart of most popular ETFs
- Platform usage statistics
- Asset allocation trends

### Orders
- Recent order history
- Order amounts and dates
- Dip-triggered orders highlighted

### System Logs
- Admin action audit trail
- Timestamps and details
- Searchable and filterable

## License

MIT License - Internal use only

