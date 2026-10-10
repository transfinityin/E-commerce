import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Key, Shield, Smartphone, Eye, EyeOff, Lock } from 'lucide-react'
import api from '../services/api'

export default function Security({ onBack }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onSubmit = async (data) => {
    if (data.new_password !== data.new_password2) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await api.post('/auth/change-password/', data)
      toast.success('Password changed!')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    }
  }

  const passwordFields = [
    { name: 'old_password', label: 'Current Password', placeholder: 'Enter current password', show: showOld, setShow: setShowOld, icon: Lock },
    { name: 'new_password', label: 'New Password', placeholder: 'Enter new password', show: showNew, setShow: setShowNew, icon: Key },
    { name: 'new_password2', label: 'Confirm New Password', placeholder: 'Confirm new password', show: showConfirm, setShow: setShowConfirm, icon: Shield },
  ]

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition hover:text-neutral-950"
      >
        <ArrowLeft size={14} /> Back to profile
      </button>

      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
          <Shield size={15} />
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
          Security
        </h2>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Manage your password and account security settings.
      </p>

      {/* Change Password */}
      <div className="mb-4 rounded-2xl bg-[#F4F4F2]/80 p-4 sm:mb-5 sm:p-5 lg:p-6">
        <div className="mb-4 flex items-center gap-3 sm:mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-white text-neutral-800 ring-1 ring-black/5">
            <Key size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Change password</h3>
            <p className="text-[11px] text-neutral-500">Update regularly for better security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:gap-4">
          {passwordFields.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.name} className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                    <Icon size={14} className="sm:w-4 sm:h-4" />
                  </span>
                  <input
                    type={f.show ? 'text' : 'password'}
                    {...register(f.name, { required: true })}
                    className="w-full !rounded-full text-xs sm:text-sm bg-white !border-0 text-neutral-900 pl-9 sm:pl-11 pr-9 sm:pr-11 py-2.5 sm:py-3 outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-neutral-950/15 transition-all placeholder:text-neutral-400"
                    placeholder={f.placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => f.setShow(!f.show)}
                    className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--color-muted)] flex items-center transition-colors duration-300 hover:text-[var(--color-text)]"
                  >
                    {f.show ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold !rounded-full px-5 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 disabled:opacity-50 self-start mt-1"
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-neutral-300 border-t-white rounded-full animate-spin" /> Updating...</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* 2FA Placeholder */}
      <div className="rounded-2xl bg-[#F4F4F2]/80 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800 ring-1 ring-black/5">
            <Smartphone size={16} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-950">Two-factor authentication</h3>
            <p className="text-[11px] text-neutral-500">Add extra security to your account</p>
          </div>
          <span className="self-start rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-neutral-500 uppercase ring-1 ring-black/6 sm:self-auto">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}