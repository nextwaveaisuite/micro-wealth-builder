// micro-wealth-builder/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// These will be set in Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using demo mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Check if user is authenticated
 */
export async function getUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription() {
  if (!supabase) return { status: 'free', plan: 'free' }
  
  const user = await getUser()
  if (!user) return { status: 'free', plan: 'free' }

  const { data, error } = await supabase
    .from('users')
    .select('subscription_status, plan')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return { status: 'free', plan: 'free' }
  }

  return {
    status: data?.subscription_status || 'free',
    plan: data?.plan || 'free'
  }
}

/**
 * Check if user has Pro access
 */
export async function isPro() {
  const sub = await getUserSubscription()
  return ['trialing', 'active'].includes(sub.status) && ['pro', 'premium'].includes(sub.plan)
}

/**
 * Sign out user
 */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => subscription.unsubscribe()
}

