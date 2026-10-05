import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, ArrowRight, KeyRound, CheckCircle2, Loader2, Lock } from 'lucide-react'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Enter your email')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/forgot-password/reset/', {
        email: email.trim(),
      })

      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F2] pt-[76px] sm:pt-[88px] lg:pt-0 overflow-x-hidden">
      <div className="grid min-h-[calc(100vh-76px)] sm:min-h-[calc(100vh-88px)] lg:min-h-screen lg:grid-cols-2">
        {/* Left Panel */}
        <aside className="hidden lg:flex relative flex-col justify-center overflow-hidden bg-[#F4F4F2] px-10 xl:px-16 2xl:px-20 py-14">
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(212,175,55,0.12),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.07),transparent_38%)] pointer-events-none" />

          <div className="absolute w-[460px] h-[460px] -top-[210px] -right-[170px] rounded-full border border-neutral-200 pointer-events-none" />
          <div className="absolute w-[540px] h-[540px] -bottom-[260px] -left-[220px] rounded-full border border-neutral-200 pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            <Link
              to="/"
              className="font-sans text-2xl xl:text-3xl text-neutral-900 block mb-12 tracking-[0.22em]"
            >
              TRANS<span className="text-gradient-gold">FINITY</span>
            </Link>

            <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 mb-4">Access Recovery</p>

            <h2 className="font-sans text-4xl xl:text-5xl 2xl:text-6xl text-neutral-900 leading-tight tracking-[0.12em] mb-6">
              RESET
              <br />
              <span className="text-gradient-gold italic">THE ACCESS.</span>
            </h2>

            <p className="text-sm xl:text-base text-neutral-500 font-mono tracking-wider leading-relaxed max-w-md">
              Enter your registered email and we will transmit a secure reset link.
              Your account security remains protected through encrypted recovery.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="w-12 h-12 border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                <KeyRound size={22} className="text-neutral-900" />
              </div>

              <div>
                <p className="text-sm font-mono text-neutral-900 tracking-wider">Secure Reset</p>
                <p className="text-xs text-neutral-500 font-mono tracking-wider mt-1">
                  Link expires after a limited window
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel */}
        <main className="relative flex items-center justify-center bg-[#F4F4F2] px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-10 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_36%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobile Logo */}
            <Link
              to="/"
              className="lg:hidden font-sans text-xl sm:text-2xl text-neutral-900 block text-center mb-7 tracking-[0.22em]"
            >
              TRANS<span className="text-gradient-gold">FINITY</span>
            </Link>

            <div className="bg-white/90 backdrop-blur-md border border-neutral-200 p-5 sm:p-7 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-px bg-neutral-950/60" />
              <div className="absolute top-0 left-0 w-px h-16 bg-neutral-950/60" />

              <div className="mb-6 sm:mb-8">
                <div className="w-11 h-11 border border-neutral-200 bg-neutral-100 flex items-center justify-center mb-5">
                  <Lock size={19} className="text-neutral-900" />
                </div>

                <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 mb-3">Account Recovery</p>

                <h1 className="font-sans text-2xl sm:text-3xl text-neutral-900 tracking-[0.12em] leading-tight mb-3">
                  FORGOT <span className="text-gradient-gold">PASSWORD</span>
                </h1>

                <p className="text-xs sm:text-sm text-neutral-500 font-mono tracking-wider leading-relaxed">
                  Enter your email to receive a secure reset signal.
                </p>
              </div>

              {/* Success State */}
              {sent && (
                <div className="text-xs sm:text-sm bg-neutral-100 border border-neutral-200 text-neutral-900 px-4 py-3 mb-5 flex items-start gap-3 animate-fadeIn">
                  <CheckCircle2 size={17} className="shrink-0 mt-0.5" />

                  <div>
                    <p className="font-mono tracking-wider text-neutral-900 mb-1">
                      Reset link sent.
                    </p>
                    <p className="font-mono text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-medium tracking-[0.28em] uppercase text-neutral-500 text-[10px] sm:text-[11px] mb-2 block">
                    Email Address
                  </label>

                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <Mail size={15} className="sm:w-4 sm:h-4" />
                    </span>

                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="signal@transfinity.shop"
                      required
                      disabled={loading || sent}
                      className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 auth-input no-eye"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || sent}
                  className="btn-primary w-full min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-xs tracking-[0.2em]">SENDING...</span>
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span className="text-xs tracking-[0.2em]">SENT SUCCESSFULLY</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs tracking-[0.2em]">SEND RESET LINK</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
                <p className="text-xs sm:text-sm text-neutral-500 font-mono tracking-wider leading-relaxed">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-neutral-900 hover:text-neutral-700 transition-colors"
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}