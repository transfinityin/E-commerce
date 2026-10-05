import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import SocialAuth from './SocialAuth'

const schema = z
  .object({
    name: z.string().min(2, 'Name too short'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone'),
    password: z.string().min(8, 'Min 8 characters'),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
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
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Registration failed')
    }
  }

  const field = (name, label, type = 'text', opts = {}) => (
    <div>
      <label className="text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          {...register(name)}
          type={opts.toggle ? (opts.show ? 'text' : 'password') : type}
          className="w-full border-b border-neutral-300 bg-transparent py-2 pr-10 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          placeholder={opts.placeholder}
        />
        {opts.toggle && (
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500"
            onClick={() => opts.setShow((v) => !v)}
          >
            {opts.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-[70vh] bg-[#F4F4F2] px-5 py-16">
      <div className="mx-auto w-full max-w-md">
        <p className="text-[10px] font-medium tracking-[0.35em] text-neutral-500 uppercase">
          Account
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-[0.06em] text-neutral-900 uppercase">
          Join the arc
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Create an account to shop, track orders, and unlock QR drops.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 flex flex-col gap-5 border border-neutral-200 bg-white p-6 md:p-8"
        >
          {field('name', 'Name', 'text', { placeholder: 'Your name' })}
          {field('email', 'Email', 'email', { placeholder: 'you@email.com' })}
          {field('phone', 'Phone', 'tel', { placeholder: '10-digit mobile' })}
          {field('password', 'Password', 'password', {
            placeholder: 'Min 8 characters',
            toggle: true,
            show: showPass,
            setShow: setShowPass,
          })}
          {field('password2', 'Confirm password', 'password', {
            placeholder: 'Re-enter password',
            toggle: true,
            show: showConfirm,
            setShow: setShowConfirm,
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-11 items-center justify-center bg-neutral-950 text-[11px] font-semibold tracking-[0.22em] text-white uppercase disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-neutral-950 underline">
              Sign in
            </Link>
          </p>

          <SocialAuth />
        </form>
      </div>
    </div>
  )
}
