// micro-wealth-builder/api/stripe-webhook.js
// Vercel Serverless Function - Stripe Webhook Handler

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Disable body parsing (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false
  }
}

// Helper to read raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
    })
    req.on('error', reject)
  })
}

// Update user subscription status in Supabase
async function updateSubscriptionStatus(userId, status, plan = 'pro') {
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      plan: plan,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature']

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' })
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).json({ error: `Webhook Error: ${err.message}` })
    }

    console.log('Stripe event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id

        if (userId) {
          await updateSubscriptionStatus(userId, 'active', 'pro')
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          // Map Stripe status to our status
          const statusMap = {
            'active': 'active',
            'trialing': 'trialing',
            'past_due': 'past_due',
            'canceled': 'canceled',
            'unpaid': 'past_due',
            'incomplete': 'past_due',
            'incomplete_expired': 'canceled',
            'paused': 'paused'
          }

          const status = statusMap[subscription.status] || 'free'
          await updateSubscriptionStatus(userId, status, 'pro')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await updateSubscriptionStatus(userId, 'canceled', 'free')
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await updateSubscriptionStatus(userId, 'past_due', 'pro')
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await updateSubscriptionStatus(userId, 'active', 'pro')
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({
      error: 'Webhook handler failed',
      message: error.message
    })
  }
}

