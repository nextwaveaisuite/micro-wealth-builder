import { createClient } from '@supabase/supabase-js';

// Supabase configuration - same as main app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin authentication
 */
export const adminAuth = {
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { data: null, error };
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (!profile) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'Not authorized as admin' } };
    }
    
    return { data, error: null };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

/**
 * Admin dashboard queries
 */
export const adminDb = {
  // Get all users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*, user_holdings(count)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get user stats
  getUserStats: async () => {
    const { data: users } = await supabase
      .from('user_settings')
      .select('user_id');
    
    const { data: holdings } = await supabase
      .from('user_holdings')
      .select('value');
    
    const totalUsers = users?.length || 0;
    const totalValue = holdings?.reduce((sum, h) => sum + parseFloat(h.value || 0), 0) || 0;
    
    return {
      totalUsers,
      totalValue,
      avgValue: totalUsers > 0 ? totalValue / totalUsers : 0
    };
  },

  // Get recent orders
  getRecentOrders: async (limit = 20) => {
    const { data, error } = await supabase
      .from('order_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Get platform usage stats
  getPlatformStats: async () => {
    const { data } = await supabase
      .from('order_history')
      .select('orders');
    
    const tickerCounts = {};
    data?.forEach(order => {
      order.orders?.forEach(o => {
        tickerCounts[o.ticker] = (tickerCounts[o.ticker] || 0) + 1;
      });
    });
    
    return Object.entries(tickerCounts)
      .map(([ticker, count]) => ({ ticker, count }))
      .sort((a, b) => b.count - a.count);
  },

  // Update user settings (admin override)
  updateUserSettings: async (userId, settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId);
    return { data, error };
  },

  // Delete user
  deleteUser: async (userId) => {
    // Delete from auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    return { error };
  },

  // Get system logs
  getSystemLogs: async (limit = 50) => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Add system log
  addSystemLog: async (action, details) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        admin_id: user?.id,
        action,
        details,
        created_at: new Date().toISOString()
      });
    return { data, error };
  }
};

