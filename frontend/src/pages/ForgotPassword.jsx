import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react'
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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">

        {/* Left Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-center bg-[var(--color-secondary)] px-16 py-16 gap-6">
          <div className="max-w-lg">
            <Link to="/" className="font-[Playfair_Display] text-3xl font-bold text-white block mb-12">
              Trans<span className="text-[var(--color-primary)]">Finity</span>
            </Link>

            <h3 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Reset <br />
              <span className="italic text-[var(--color-primary)]">access.</span>
            </h3>

            <p className="text-base text-white/60 leading-relaxed max-w-md">
              Enter your email and we'll send you a secure password reset link. Your account security is our priority.
            </p>

            {/* Decorative circles */}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <KeyRound size={22} className="text-[var(--color-primary)]" />
              </div>
              <div className="text-sm text-white/40">
                <p className="font-semibold text-white/70">Secure Reset</p>
                <p>Link expires in 15 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)] px-6 py-12">
          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <Link to="/" className="lg:hidden font-[Playfair_Display] text-2xl font-bold text-[var(--color-text)] block text-center mb-10">
              Trans<span className="text-[var(--color-primary)]">Finity</span>
            </Link>

            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
                Account Recovery
              </p>
              <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                Forgot Password
              </h1>
              <p className="text-sm text-[var(--color-muted)]">
                Enter your email to receive a reset link.
              </p>
            </div>

            {/* Success State */}
            {sent && (
              <div className="rounded-xl text-sm font-semibold bg-[var(--color-primary-light)] border border-[var(--color-border)] text-[var(--color-primary-dark)] px-5 py-4 mb-6 flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Reset link sent!</p>
                  <p className="font-normal text-xs opacity-80">Please check your email inbox and spam folder.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl text-sm bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-[var(--color-text)] pl-11 pr-4 py-3.5 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || sent}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle2 size={16} /> Sent Successfully
                  </>
                ) : (
                  <>Send Reset Link <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
              <p className="text-sm text-[var(--color-muted)]">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}