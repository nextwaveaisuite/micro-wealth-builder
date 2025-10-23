// micro-wealth-builder/src/pages/Auth.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/')
      } else if (mode === 'signup') {
        await signUp(email, password)
        setMessage('Check your email to confirm your account!')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setMessage('Password reset link sent to your email!')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#f2f6ff',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Wealth Builder
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#9fb0d0',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'reset' && 'Reset your password'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#9fb0d0',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#f2f6ff',
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'reset' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: '#9fb0d0',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#f2f6ff',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: '6px',
              color: '#ff6b6b',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              padding: '12px',
              background: 'rgba(122,240,178,0.1)',
              border: '1px solid rgba(122,240,178,0.3)',
              borderRadius: '6px',
              color: '#7af0b2',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #4db5ff 0%, #7af0b2 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#0a0e27',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Loading...' : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Sign Up' :
              'Send Reset Link'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#9fb0d0'
        }}>
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('reset')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4db5ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '13px',
                  marginBottom: '12px',
                  display: 'block',
                  width: '100%'
                }}
              >
                Forgot password?
              </button>
              <div>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4db5ff',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '13px'
                  }}
                >
                  Sign up
                </button>
              </div>
            </>
          )}
          
          {mode === 'signup' && (
            <div>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4db5ff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '13px'
                }}
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4db5ff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px'
              }}
            >
              Back to sign in
            </button>
          )}
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '12px',
          color: '#6b7a99',
          textAlign: 'center'
        }}>
          General information only — not financial advice.
          <br />
          We don't hold funds or place orders.
        </div>
      </div>
    </div>
  )
}

