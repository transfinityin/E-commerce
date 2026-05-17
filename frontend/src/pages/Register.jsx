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
  name:      z.string().min(2, 'Name too short'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().min(10, 'Invalid phone'),
  password:  z.string().min(8, 'Min 8 characters'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Passwords do not match',
  path: ['password2'],
})

export default function Register() {
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    { name: 'name',      label: 'Full Name',        type: 'text',     placeholder: 'John Doe', icon: User },
    { name: 'email',     label: 'Email Address',    type: 'email',    placeholder: 'you@example.com', icon: Mail },
    { name: 'phone',     label: 'Phone Number',     type: 'tel',      placeholder: '9876543210', icon: Phone },
    { name: 'password',  label: 'Password',         type: 'password', placeholder: 'Minimum 8 characters', icon: Lock, showToggle: true, showState: showPass, setShow: setShowPass },
    { name: 'password2', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password', icon: Lock, showToggle: true, showState: showConfirm, setShow: setShowConfirm },
  ]

  return (
    <div className="grid min-h-[calc(100vh-136px)] lg:grid-cols-2">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative flex-col justify-center items-start overflow-hidden bg-[var(--color-secondary)] text-white px-14 py-16">
        {/* Decorative circles */}
        <div className="absolute w-[480px] h-[480px] -top-[180px] -right-[160px] rounded-full border border-[var(--color-primary)]/10 pointer-events-none" />
        <div className="absolute w-[560px] h-[560px] -bottom-[220px] -left-[180px] rounded-full border border-[var(--color-primary)]/10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">

          <Link to="/" className="font-[Playfair_Display] text-3xl font-bold text-white no-underline block mb-12">
            Trans<span className="text-[var(--color-primary)]">Finity</span>
          </Link>

          <h3 className="font-[Playfair_Display] text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
            Join <br />
            <span className="italic text-[var(--color-primary)]">us.</span>
          </h3>

          <p className="text-base text-white/55 leading-relaxed max-w-sm mb-10">
            Create your account to unlock premium collections, faster checkout, wishlist access, and exclusive offers.
          </p>

          {/* Testimonial Card */}
          <div className="bg-white/5 border border-white/[0.08] rounded-2xl p-6">
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              "Premium experience from browsing to delivery. Everything feels elegant."
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
      <div className="flex flex-col justify-center items-center bg-[var(--color-bg)] px-6 py-12 lg:px-10">
        <Link to="/" className="lg:hidden font-[Playfair_Display] text-2xl font-bold text-[var(--color-text)] no-underline block mb-10">
          Trans<span className="text-[var(--color-primary)]">Finity</span>
        </Link>

        <div className="w-full max-w-md animate-fadeUp">

          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">
            Get Started
          </p>
          <h1 className="font-[Playfair_Display] text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2">
            Create Account
          </h1>
          <p className="text-sm text-[var(--color-muted)] mb-7">
            Join TransFinity and start your premium shopping experience.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {fields.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.name} className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-[var(--color-text)] tracking-wide">
                    {f.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                      <Icon size={16} />
                    </span>
                    <input
                      {...register(f.name)}
                      type={f.showToggle ? (f.showState ? 'text' : 'password') : f.type}
                      placeholder={f.placeholder}
                      className={`w-full bg-[var(--color-surface)] border-[1.5px] border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] transition-all duration-300 focus:border-[var(--color-text)] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none pl-11 pr-4 h-12 placeholder:text-[var(--color-muted-light)] ${errors[f.name] ? '!border-[var(--color-danger)]' : ''}`}
                    />
                    {f.showToggle && (
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--color-muted)] flex items-center transition-colors duration-300 hover:text-[var(--color-text)]"
                        onClick={() => f.setShow(!f.showState)}
                      >
                        {f.showState ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {errors[f.name] && (
                    <span className="text-[var(--color-danger)] text-xs">{errors[f.name].message}</span>
                  )}
                </div>
              )
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--color-btn)] hover:bg-[var(--color-btn-hover)] text-[var(--color-btn-text)] border-none rounded-xl text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-px hover:shadow-lg active:translate-y-0 disabled:bg-[var(--color-muted)] disabled:cursor-not-allowed h-[50px] mt-2"
            >
              {isSubmitting ? (
                <><span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>

          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[var(--color-border-light)]" />
            <span className="text-xs text-[var(--color-muted)] font-medium whitespace-nowrap">or Sign up with</span>
            <div className="flex-1 h-px bg-[var(--color-border-light)]" />
          </div>

          <SocialAuth mode="register" />

          <p className="text-center text-sm text-[var(--color-muted)] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] no-underline font-medium hover:text-[var(--color-primary-dark)] transition-colors">
              Login
            </Link>
          </p>

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