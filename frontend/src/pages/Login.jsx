import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Star } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import SocialAuth from './SocialAuth'

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const { login }  = useAuthStore()
  const navigate   = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-136px)] lg:grid-cols-2">

      {/* LEFT PANEL - Desktop only */}
      <div className="hidden lg:flex relative flex-col justify-center items-start overflow-hidden bg-[var(--color-secondary)] text-white px-10 xl:px-14 py-12 xl:py-16">
        {/* Decorative circles */}
        <div className="absolute w-[400px] h-[400px] xl:w-[480px] xl:h-[480px] -top-[180px] -right-[160px] rounded-full border border-[var(--color-primary)]/10 pointer-events-none" />
        <div className="absolute w-[480px] h-[480px] xl:w-[560px] xl:h-[560px] -bottom-[220px] -left-[180px] rounded-full border border-[var(--color-primary)]/10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">

          <Link to="/" className="font-[Playfair_Display] text-2xl xl:text-3xl font-bold text-white no-underline block mb-8 xl:mb-12">
            Trans<span className="text-[var(--color-primary)]">Finity</span>
          </Link>

          <h2 className="font-[Playfair_Display] text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight mb-4 xl:mb-5">
            Welcome<br />
            <span className="text-[var(--color-primary)] italic">back.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Sign in to access your curated collection, track orders, and enjoy exclusive member benefits.
          </p>

          {/* Testimonial Card */}
          <div className="bg-white/5 border border-white/[0.08] rounded-2xl mt-10 xl:mt-14 p-5 xl:p-6">
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              "Absolutely love the curation. Every product feels premium and the delivery was lightning fast."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-[Playfair_Display] text-[15px] font-bold text-white shrink-0">
                P
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Priya S.</p>
                <p className="text-xs text-white/35">Verified Customer</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center items-center bg-[var(--color-bg)] px-4 sm:px-6 py-8 sm:py-10 lg:px-8 xl:px-10 min-h-full">
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden font-[Playfair_Display] text-xl sm:text-2xl font-bold text-[var(--color-text)] no-underline block mb-6 sm:mb-8">
          Trans<span className="text-[var(--color-primary)]">Finity</span>
        </Link>

        <div className="w-full max-w-sm sm:max-w-md animate-fadeUp">

          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
            Member Access
          </p>
          <h1 className="font-[Playfair_Display] text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-1.5 sm:mb-2">
            Sign In
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-6 sm:mb-8 lg:mb-9">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-primary)] no-underline font-medium hover:text-[var(--color-primary-dark)] transition-colors">
              Create one
            </Link>
          </p>

          <SocialAuth className="pb-6 sm:pb-8 lg:pb-10" mode="login" />

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 sm:gap-4 lg:gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-xs sm:text-[13px] font-semibold text-[var(--color-text)] tracking-wide">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                  <Mail size={14} className="sm:w-4 sm:h-4" />
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] transition-all duration-300 focus:border-[var(--color-text)] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none pl-10 sm:pl-11 pr-4 h-11 sm:h-12 placeholder:text-[var(--color-muted-light)] ${errors.email ? '!border-[var(--color-danger)]' : ''}`}
                />
              </div>
              {errors.email && <span className="text-[var(--color-danger)] text-xs">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-[13px] font-semibold text-[var(--color-text)] tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] sm:text-xs text-[var(--color-muted)] no-underline hover:text-[var(--color-text)] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                  <Lock size={14} className="sm:w-4 sm:h-4" />
                </span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] transition-all duration-300 focus:border-[var(--color-text)] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 placeholder:text-[var(--color-muted-light)] ${errors.password ? '!border-[var(--color-danger)]' : ''}`}
                />
                <button
                  type="button"
                  className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--color-muted)] flex items-center transition-colors duration-300 hover:text-[var(--color-text)]"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[var(--color-danger)] text-xs">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] border-none rounded-xl text-sm sm:text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-300 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:bg-[var(--color-muted)] disabled:cursor-not-allowed h-12 sm:h-[50px] mt-1 sm:mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" /></>
              )}
            </button>

          </form>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.45s ease both;
        }
      `}</style>
    </div>
  )
}