import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
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

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Registration failed')
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-136px)] lg:grid-cols-2">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative flex-col justify-center items-start overflow-hidden bg-[#0D0D0D] text-white" style={{ padding: '64px 56px' }}>
        <div className="absolute w-[480px] h-[480px] -top-[180px] -right-[160px] rounded-full border border-[rgba(200,169,110,0.12)] pointer-events-none" />
        <div className="absolute w-[560px] h-[560px] -bottom-[220px] -left-[180px] rounded-full border border-[rgba(200,169,110,0.12)] pointer-events-none" />

        <div className="relative z-10 w-full" style={{ maxWidth: '420px' }}>

          <h2 className="font-[Playfair_Display] text-5xl md:text-6xl font-bold text-white leading-tight">
            Trans<span className="text-[#C8A96E]">Finity</span>
          </h2>

          <h3 className="font-[Playfair_Display] text-5xl md:text-6xl font-bold text-white leading-tight" style={{ marginTop: '24px' }}>
            Join <br />
            <span className="italic text-[#C8A96E]">us.</span>
          </h3>

          <p className="text-base text-white/55 leading-relaxed max-w-sm" style={{ marginTop: '24px' }}>
            Create your account to unlock premium collections, faster checkout,
            wishlist access, and exclusive offers.
          </p>

          <div className="bg-white/5 border border-white/[0.08] rounded-[20px]" style={{ marginTop: '56px', padding: '24px' }}>
            <p className="text-white/60 text-sm leading-[1.75]" style={{ marginBottom: '16px' }}>"Premium experience from browsing to delivery. Everything feels elegant."</p>
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
        <div className="w-full animate-[fadeUp_0.45s_ease_both]" style={{ maxWidth: '460px' }}>

          <h1 className="font-[Playfair_Display] text-3xl md:text-4xl font-bold text-[#0D0D0D]" style={{ marginBottom: '8px' }}>Create Account</h1>

          <p className="text-sm text-[#8A8A8A]" style={{ marginBottom: '28px' }}>
            Join TransFinity and start your premium shopping experience.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ gap: '16px' }}>

            {[
              { name: 'name',      label: 'Full Name',        type: 'text',     placeholder: 'John Doe' },
              { name: 'email',     label: 'Email Address',    type: 'email',    placeholder: 'you@example.com' },
              { name: 'phone',     label: 'Phone Number',     type: 'tel',      placeholder: '9876543210' },
              { name: 'password',  label: 'Password',         type: 'password', placeholder: 'Minimum 8 characters' },
              { name: 'password2', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password' },
            ].map((f) => (
              <div key={f.name} className="flex flex-col" style={{ gap: '7px' }}>
                <label className="text-[13px] font-semibold text-[#0D0D0D] tracking-wide">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  placeholder={f.placeholder}
                  className={`w-full bg-white border-[1.5px] border-[#E8E4DE] rounded-xl font-['DM_Sans'] text-sm text-[#0D0D0D] transition-all duration-300 focus:border-[#0D0D0D] focus:shadow-[0_0_0_3px_rgba(13,13,13,0.06)] outline-none${errors[f.name] ? ' !border-[#D64545]' : ''}`}
                  style={{ height: '48px', padding: '0 16px' }}
                />
                {errors[f.name] && (
                  <span className="text-[#D64545] text-xs" style={{ marginTop: '2px' }}>{errors[f.name].message}</span>
                )}
              </div>
            ))}

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#0D0D0D] text-white border-none rounded-xl font-['DM_Sans'] text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-300 hover:bg-[#3A3A3A] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(13,13,13,0.08)] active:translate-y-0 disabled:bg-[#8A8A8A] disabled:cursor-not-allowed" style={{ height: '50px', marginTop: '8px' }}>
              {isSubmitting ? (
                <><div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>

          </form>

          <div className="flex items-center gap-4" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div className="flex-1 h-px bg-[#E8E4DE]" />
            <span className="text-xs text-[#8A8A8A] font-medium whitespace-nowrap">or Sign up with</span>
            <div className="flex-1 h-px bg-[#E8E4DE]" />
          </div>

          <SocialAuth mode="register" />

          <p className="text-center text-sm text-[#8A8A8A]" style={{ marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-[#C8A96E] no-underline font-medium transition-colors duration-300 hover:text-[#A8873E]">
              Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}