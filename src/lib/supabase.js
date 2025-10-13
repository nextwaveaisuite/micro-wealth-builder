import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication helpers
 */
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

/**
 * Database helpers for user settings
 */
export const db = {
  // Save user settings
  saveSettings: async (userId, settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        risk_band: settings.riskBand,
        contribution_amount: settings.contribution.amount,
        contribution_cadence: settings.contribution.cadence,
        buy_the_dip_enabled: settings.buyTheDip.enabled,
        buy_the_dip_extra: settings.buyTheDip.extraAmount,
        updated_at: new Date().toISOString()
      });
    return { data, error };
  },

  // Load user settings
  loadSettings: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return { data: null, error };
    
    // Transform database format to app format
    return {
      data: {
        riskBand: data.risk_band,
        contribution: {
          amount: data.contribution_amount,
          cadence: data.contribution_cadence
        },
        buyTheDip: {
          enabled: data.buy_the_dip_enabled,
          extraAmount: data.buy_the_dip_extra
        }
      },
      error: null
    };
  },

  // Save holdings
  saveHoldings: async (userId, holdings) => {
    const { data, error } = await supabase
      .from('user_holdings')
      .upsert(
        holdings.map(h => ({
          user_id: userId,
          ticker: h.ticker,
          units: h.units,
          value: h.value,
          updated_at: new Date().toISOString()
        }))
      );
    return { data, error };
  },

  // Load holdings
  loadHoldings: async (userId) => {
    const { data, error } = await supabase
      .from('user_holdings')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  // Save order history
  saveOrder: async (userId, orderPlan) => {
    const { data, error } = await supabase
      .from('order_history')
      .insert({
        user_id: userId,
        orders: orderPlan.orders,
        total_amount: orderPlan.totalAmount,
        dip_extra: orderPlan.dipExtra,
        created_at: new Date().toISOString()
      });
    return { data, error };
  },

  // Load order history
  loadOrderHistory: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('order_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }
};

