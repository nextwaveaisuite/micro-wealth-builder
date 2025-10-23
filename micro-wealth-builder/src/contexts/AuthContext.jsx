// micro-wealth-builder/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, getUser, getUserSubscription, signOut as supabaseSignOut } from '../lib/supabase'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState({ status: 'free', plan: 'free' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        if (session?.user) {
          setUser(session.user)
          await loadSubscription()
        } else {
          setUser(null)
          setSubscription({ status: 'free', plan: 'free' })
        }
        setLoading(false)
      }
    )

    return () => {
      authSubscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const currentUser = await getUser()
      setUser(currentUser)
      if (currentUser) {
        await loadSubscription()
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSubscription() {
    try {
      const sub = await getUserSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    setUser(data.user)
    await loadSubscription()
    return data
  }

  async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error

    return data
  }

  async function signOut() {
    await supabaseSignOut()
    setUser(null)
    setSubscription({ status: 'free', plan: 'free' })
  }

  async function resetPassword(email) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  const isPro = ['trialing', 'active'].includes(subscription.status) && 
                ['pro', 'premium'].includes(subscription.plan)

  const value = {
    user,
    subscription,
    loading,
    isPro,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSubscription: loadSubscription
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

