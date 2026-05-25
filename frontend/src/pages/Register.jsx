import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff, Star } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import SocialAuth from './SocialAuth'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone'),
  password: z.string().min(8, 'Min 8 characters'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwords do not match',
  path: ['password2'],
})

export default function Register() {
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Registration failed')
    }
  }

  const fields = [
    {
      name: 'name',
      label: 'CODENAME',
      type: 'text',
      placeholder: 'Wanderer-001',
      icon: User,
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      placeholder: 'signal@transfinity.shop',
      icon: Mail,
    },
    {
      name: 'phone',
      label: 'SIGNAL',
      type: 'tel',
      placeholder: 'Your phone number',
      icon: Phone,
    },
    {
      name: 'password',
      label: 'PASSPHRASE',
      type: 'password',
      placeholder: 'Minimum 8 characters',
      icon: Lock,
      showToggle: true,
      showState: showPass,
      setShow: setShowPass,
    },
    {
      name: 'password2',
      label: 'CONFIRM PASSPHRASE',
      type: 'password',
      placeholder: 'Re-enter passphrase',
      icon: Lock,
      showToggle: true,
      showState: showConfirm,
      setShow: setShowConfirm,
    },
  ]

  const inputClass = (hasError) =>
    `input-gold w-full pl-9 pr-3 text-sm sm:text-[15px] text-white placeholder:text-muted/45 bg-transparent ${
      hasError ? '!border-[var(--color-danger)]' : ''
    }`

  return (
    <div className="min-h-screen bg-black overflow-x-hidden pt-[76px] sm:pt-[88px] lg:pt-0">
      <div className="grid min-h-[calc(100vh-76px)] sm:min-h-[calc(100vh-88px)] lg:min-h-screen lg:grid-cols-2">

        {/* LEFT PANEL - DESKTOP */}
        <aside className="hidden lg:flex relative flex-col justify-center items-start overflow-hidden bg-[#050505] text-white px-10 xl:px-14 2xl:px-20 py-12 xl:py-16">
          {/* Background Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_20%,rgba(212,175,55,0.10),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.07),transparent_35%)]" />

          {/* Decorative Circles */}
          <div className="absolute w-[420px] h-[420px] xl:w-[520px] xl:h-[520px] -top-[190px] -right-[170px] rounded-full border border-gold/15 pointer-events-none" />
          <div className="absolute w-[520px] h-[520px] xl:w-[620px] xl:h-[620px] -bottom-[260px] -left-[220px] rounded-full border border-gold/10 pointer-events-none" />

          {/* Subtle Grid */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg">
            <Link
              to="/"
              className="font-display text-2xl xl:text-3xl font-bold text-white no-underline block mb-10 xl:mb-14 tracking-[0.22em]"
            >
              TRANS<span className="text-gradient-gold">FINITY</span>
            </Link>

            <p className="label-gold mb-4">New Identity Protocol</p>

            <h2 className="font-display text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-tight mb-5 xl:mb-6 tracking-[0.12em]">
              CROSS <br />
              <span className="text-gradient-gold italic">THE THRESHOLD.</span>
            </h2>

            <p className="text-sm xl:text-base text-muted leading-relaxed max-w-md mb-9 xl:mb-11 font-mono tracking-wider">
              Forge your TRANSFINITY identity. Create your account to unlock premium collections,
              faster checkout, and exclusive arcs.
            </p>

            {/* Testimonial Card */}
            <div className="relative bg-[#0A0A0A]/90 border border-gold/20 p-5 xl:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-px bg-gold/70" />
              <div className="absolute top-0 left-0 w-px h-16 bg-gold/70" />

              <p className="text-muted text-sm leading-relaxed mb-5 italic">
                "Premium experience from browsing to delivery. Everything feels like an artifact."
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold flex items-center justify-center font-display text-[15px] font-bold text-black shrink-0">
                  P
                </div>

                <div>
                  <p className="text-xs font-semibold text-white tracking-wider">Priya S.</p>
                  <p className="text-xs text-muted font-mono">Verified Wanderer</p>
                </div>

                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={12} className="text-gold fill-gold" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="relative flex flex-col justify-center items-center bg-black px-4 sm:px-6 md:px-8 py-8 sm:py-10 lg:px-10 xl:px-12 min-h-full overflow-hidden">
          {/* Mobile/Tablet Background Effects */}
          <div className="absolute inset-0 pointer-events-none grid-bg opacity-20 lg:opacity-10" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_35%)]" />

          {/* Mobile Logo */}
          <Link
            to="/"
            className="relative z-10 lg:hidden font-display text-xl sm:text-2xl font-bold text-white no-underline block mb-6 sm:mb-8 tracking-[0.22em]"
          >
            TRANS<span className="text-gradient-gold">FINITY</span>
          </Link>

          <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fadeUp">
            {/* Register Card */}
            <div className="bg-[#0A0A0A]/85 backdrop-blur-md border border-gold/15 p-5 sm:p-7 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-14 h-px bg-gold/60" />
              <div className="absolute top-0 left-0 w-px h-14 bg-gold/60" />

              <div className="mb-6 sm:mb-7">
                <p className="label-gold mb-3">GET STARTED</p>

                <h1 className="font-display text-[1.65rem] sm:text-3xl md:text-4xl font-bold text-white mb-2 leading-tight tracking-[0.12em]">
                  CROSS THE <span className="text-gradient-gold">THRESHOLD</span>
                </h1>

                <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
                  Forge your TRANSFINITY identity.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {fields.map((f) => {
                  const Icon = f.icon
                  const hasError = Boolean(errors[f.name])

                  return (
                    <div key={f.name} className="flex flex-col gap-1.5">
                      <label className="label-gold text-[10px] sm:text-[11px]">
                        {f.label}
                      </label>

                    <div className="auth-input-wrap">
  <span className="auth-input-icon">
    <Icon size={15} className="sm:w-4 sm:h-4" />
  </span>

  <input
    {...register(f.name)}
    type={f.showToggle ? (f.showState ? 'text' : 'password') : f.type}
    placeholder={f.placeholder}
    className={`input-gold auth-input ${!f.showToggle ? 'no-eye' : ''} ${
      hasError ? '!border-[var(--color-danger)]' : ''
    }`}
  />

  {f.showToggle && (
    <button
      type="button"
      className="auth-input-eye"
      onClick={() => f.setShow(!f.showState)}
      aria-label={f.showState ? 'Hide password' : 'Show password'}
    >
      {f.showState ? (
        <EyeOff size={15} className="sm:w-4 sm:h-4" />
      ) : (
        <Eye size={15} className="sm:w-4 sm:h-4" />
      )}
    </button>
  )}
</div>

                      {hasError && (
                        <span className="text-[var(--color-danger)] text-xs font-mono tracking-wide">
                          {errors[f.name].message}
                        </span>
                      )}
                    </div>
                  )
                })}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full mt-2 min-h-[48px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span className="text-xs tracking-[0.2em]">INITIATING ARC...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs tracking-[0.2em]">INITIATE ARC</span>
                      <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 sm:gap-4 my-5 sm:my-6">
                <div className="flex-1 h-px bg-gold/15" />
                <span className="text-[10px] sm:text-xs text-muted font-mono tracking-[0.25em] whitespace-nowrap">
                  — OR —
                </span>
                <div className="flex-1 h-px bg-gold/15" />
              </div>

              <SocialAuth
                mode="register"
                className="w-full"
                buttonClass="btn-outline w-full"
              />

              <p className="text-center text-xs sm:text-sm text-muted mt-5 sm:mt-6 font-mono tracking-wider leading-relaxed">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-gold no-underline font-medium hover:text-gold-light transition-colors"
                >
                  ENTER THE WORLD
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}