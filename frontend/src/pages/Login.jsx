import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import SocialAuth from './SocialAuth'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

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
    <div className="min-h-[70vh] bg-[#F4F4F2] px-5 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
          Account
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-[0.06em] text-neutral-900 uppercase">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-neutral-600">Sign in to continue your arc.</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 flex flex-col gap-5 border border-neutral-200 bg-white p-6 md:p-8"
        >
          <div>
            <label className="text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-2 w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              placeholder="you@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] tracking-wide text-neutral-500 hover:text-neutral-900"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative mt-2">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                className="w-full border-b border-neutral-300 bg-transparent py-2 pr-10 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="email-sign-in"
            aria-label="Sign in with email"
            className="mt-2 h-12 bg-neutral-950 text-[11px] font-semibold tracking-[0.22em] text-white uppercase hover:bg-neutral-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <SocialAuth />

          <p className="text-center text-sm text-neutral-600">
            New here?{' '}
            <Link to="/register" className="font-medium text-neutral-900 underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
