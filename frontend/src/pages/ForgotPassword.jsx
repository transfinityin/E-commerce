import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/auth/forgot-password/', { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 200px)' }}>
        
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center" style={{ 
          flex: '1',
          background: 'var(--color-secondary)',
          padding: '64px',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '480px' }}>
            <h2 className="text-4xl font-bold" style={{ color: 'var(--color-text-inverse)', marginBottom: '48px' }}>
              Trans<span style={{ color: 'var(--color-primary)' }}>Finity</span>
            </h2>

            <h3 className="text-5xl font-bold" style={{ 
              color: 'var(--color-text-inverse)', 
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              Reset <br />
              <span className="italic" style={{ color: 'var(--color-primary)' }}>access.</span>
            </h3>

            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              Enter your email and we'll send you a secure password reset link.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center" style={{ 
          background: 'var(--color-surface)',
          padding: '32px 24px'
        }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            
            <h1 className="text-3xl font-bold" style={{ 
              color: 'var(--color-text)', 
              marginBottom: '8px' 
            }}>
              Forgot Password
            </h1>

            <p style={{ 
              color: 'var(--color-muted)', 
              fontSize: '14px',
              marginBottom: '32px'
            }}>
              Enter your email to receive a reset link.
            </p>

            {sent && (
              <div className="rounded-xl text-sm font-semibold" style={{ 
                background: 'var(--color-primary-light)', 
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary-dark)',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                Reset link sent successfully. Please check your email.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  Email Address
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl text-sm outline-none transition-all"
                  style={{ 
                    padding: '14px 18px',
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full text-sm font-bold rounded-xl transition-all border-none cursor-pointer"
                style={{ 
                  padding: '14px 24px',
                  background: loading ? 'var(--color-bg-alt)' : 'var(--color-primary)',
                  color: loading ? 'var(--color-muted)' : 'var(--color-btn-text)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <Link
              to="/login"
              className="block text-center text-sm font-semibold transition-colors"
              style={{ 
                color: 'var(--color-primary-dark)',
                marginTop: '24px',
                padding: '8px'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}