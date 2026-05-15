import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
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
    <div className="grid min-h-[calc(100vh-136px)] lg:grid-cols-2">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative flex-col justify-center items-start overflow-hidden bg-[#0D0D0D] text-white" style={{ padding: '64px 56px' }}>
        <div className="absolute w-[480px] h-[480px] -top-[180px] -right-[160px] rounded-full border border-[rgba(200,169,110,0.12)] pointer-events-none" />
        <div className="absolute w-[560px] h-[560px] -bottom-[220px] -left-[180px] rounded-full border border-[rgba(200,169,110,0.12)] pointer-events-none" />

        <div className="relative z-10 w-full" style={{ maxWidth: '420px' }}>

          <Link to="/" className="font-[Playfair_Display] text-3xl font-bold text-white no-underline block" style={{ marginBottom: '48px' }}>
            Trans<span className="text-[#C8A96E]">Finity</span>
          </Link>

          <h2 className="font-[Playfair_Display] text-4xl md:text-5xl font-bold text-white leading-tight" style={{ marginBottom: '20px' }}>
            Welcome<br />
            <span className="text-[#C8A96E] italic">back.</span>
          </h2>

          <p className="text-sm text-white/45 leading-relaxed" style={{ maxWidth: '320px' }}>
            Sign in to access your curated collection, track orders, and enjoy exclusive member benefits.
          </p>

          <div className="bg-white/5 border border-white/[0.08] rounded-[20px]" style={{ marginTop: '56px', padding: '24px' }}>
            <p className="text-white/60 text-sm leading-[1.75]" style={{ marginBottom: '16px' }}>"Absolutely love the curation. Every product feels premium and the delivery was lightning fast."</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C8A96E] flex items-center justify-center font-[Playfair_Display] text-[15px] font-bold text-white shrink-0">P</div>
              <div>
                <p className="text-xs font-semibold text-white">Priya S.</p>
                <p className="text-xs text-white/35">Verified Customer</p>
              </div>
              <span className="ml-auto text-[#C8A96E] text-[13px] tracking-wide">★★★★★</span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center items-center bg-[#FAFAF8]" style={{ padding: '48px 40px' }}>
        <Link to="/" className="lg:hidden font-[Playfair_Display] text-2xl font-bold text-[#0D0D0D] no-underline block" style={{ marginBottom: '40px' }}>
          Trans<span className="text-[#C8A96E]">Finity</span>
        </Link>

        <div className="w-full animate-[fadeUp_0.45s_ease_both]" style={{ maxWidth: '460px' }}>

          <h1 className="font-[Playfair_Display] text-3xl md:text-4xl font-bold text-[#0D0D0D]" style={{ marginBottom: '8px' }}>Sign In</h1>

          <p className="text-sm text-[#8A8A8A]" style={{ marginBottom: '36px' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-[#C8A96E] no-underline font-medium transition-colors duration-300 hover:text-[#A8873E]">
              Create one
            </Link>
          </p>

          <SocialAuth mode="login" />

          <div className="flex items-center gap-4" style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div className="flex-1 h-px bg-[#E8E4DE]" />
            <span className="text-xs text-[#8A8A8A] font-medium whitespace-nowrap">or Sign in with</span>
            <div className="flex-1 h-px bg-[#E8E4DE]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '20px' }}>

            {/* Email */}
            <div className="flex flex-col" style={{ gap: '7px' }}>
              <label className="text-[13px] font-semibold text-[#0D0D0D] tracking-wide">Email address</label>
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none flex items-center">
                  <Mail size={16} />
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full bg-white border-[1.5px] border-[#E8E4DE] rounded-xl font-['DM_Sans'] text-sm text-[#0D0D0D] transition-all duration-300 focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none${errors.email ? ' !border-[#D64545]' : ''}`}
                  style={{ height: '48px', paddingLeft: '42px', paddingRight: '16px' }}
                />
              </div>
              {errors.email && <span className="text-[#D64545] text-xs" style={{ marginTop: '2px' }}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col" style={{ gap: '7px' }}>
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-[#0D0D0D] tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#8A8A8A] no-underline transition-colors duration-300 hover:text-[#0D0D0D]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none flex items-center">
                  <Lock size={16} />
                </span>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white border-[1.5px] border-[#E8E4DE] rounded-xl font-['DM_Sans'] text-sm text-[#0D0D0D] transition-all duration-300 focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none${errors.password ? ' !border-[#D64545]' : ''}`}
                  style={{ height: '48px', paddingLeft: '42px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#8A8A8A] p-0 flex items-center transition-colors duration-300 hover:text-[#0D0D0D]"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-[#D64545] text-xs" style={{ marginTop: '2px' }}>{errors.password.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0D0D0D] text-white border-none rounded-xl font-['DM_Sans'] text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-[#3A3A3A] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(13,13,13,0.08)] active:translate-y-0 disabled:bg-[#8A8A8A] disabled:cursor-not-allowed" style={{ height: '50px', marginTop: '8px' }}>
              {isSubmitting ? (
                <><div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  )
}