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
    <div className="min-h-screen bg-[var(--color-bg)] relative overflow-hidden">
      
      {/* Starfield Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80)',
        }}
      ></div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none"></div>
      
      {/* Gold Dust Particles (CSS only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-[var(--color-gold)] rounded-full animate-twinkle opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
     <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16">

        {/* Header Title */}
        <div className="text-center mb-7 sm:mb-10 animate-fadeUp">
  <p className="label-gold mb-3">Account Access</p>

  <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl text-white tracking-[0.12em] sm:tracking-[0.15em] leading-tight mb-3">
    WELCOME BACK,<br />
    <span className="text-gradient-gold">WANDERER</span>
  </h1>

  <p className="text-sm sm:text-base text-muted tracking-wide font-mono">
    Your arc continues.
  </p>
</div>

        {/* Login Card */}
        <div className="w-full max-w-sm sm:max-w-md animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          
          {/* Form Container */}
         <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-gold/20 p-5 sm:p-8 md:p-10 relative shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden">
            
            {/* Corner Accent */}
            <div className="absolute top-0 left-0 w-12 h-px bg-[var(--color-gold)]"></div>
            <div className="absolute top-0 left-0 w-px h-12 bg-[var(--color-gold)]"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 sm:gap-6">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="label-gold text-[10px] sm:text-xs">
                  EMAIL
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="signal@transfinity.shop"
                 className={`input-gold w-full text-sm sm:text-[15px] text-white placeholder:text-muted/50 bg-transparent ${errors.email ? '!border-[var(--color-danger)]' : ''}`}
                  style={{ background: 'transparent' }}
                />
                {errors.email && <span className="text-[var(--color-danger)] text-xs mt-1">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="label-gold text-[10px] sm:text-xs">
                    PASSPHRASE
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[10px] sm:text-xs text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors duration-300 tracking-wide"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-gold w-full text-sm sm:text-[15px] text-white placeholder:text-muted/50 bg-transparent ${errors.password ? '!border-[var(--color-danger)]' : ''}`}
                    style={{ background: 'transparent' }}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer text-muted hover:text-gold active:scale-95 transition-all duration-300"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="text-[var(--color-danger)] text-xs mt-1">{errors.password.message}</span>}
              </div>

              {/* Submit Button */}
              <button
  type="submit"
  disabled={isSubmitting}
  className="btn-primary w-full mt-2 min-h-[48px]"
>
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span className="text-xs tracking-[0.2em]">ENTERING...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs tracking-[0.2em]">ENTER THE WORLD</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6 sm:my-8">
              <div className="h-px flex-1 bg-[var(--color-border)]"></div>
              <span className="text-[10px] text-[var(--color-muted)] tracking-[0.3em] uppercase">— OR —</span>
              <div className="h-px flex-1 bg-[var(--color-border)]"></div>
            </div>

            {/* Social Auth - Outline Style */}
            <SocialAuth 
              className="w-full" 
              mode="login" 
              buttonClass="btn-outline w-full"
            />

          </div>

          {/* Bottom Links */}
          <div className="mt-6 sm:mt-8 text-center">
  <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
    <Link
      to="/register"
      className="text-gold hover:text-gold-light transition-colors duration-300"
    >
      Create account
    </Link>
    <span className="mx-2 text-gold/25">·</span>
    <Link
      to="/forgot-password"
      className="text-gold hover:text-gold-light transition-colors duration-300"
    >
      Forgot passphrase
    </Link>
  </p>
</div>

        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-[10px] text-[var(--color-muted)] tracking-[0.2em] uppercase">
            Protected by Transfinity Systems // Year 2104
          </p>
        </div>

      </div>

    </div>
  )
}