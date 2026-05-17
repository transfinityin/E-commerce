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
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 lg:p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors border-none cursor-pointer mb-6 gap-2 bg-transparent"
      >
        <ArrowLeft size={18} /> Back to Profile
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
          <Shield size={16} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Security
        </h2>
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-8">
        Manage your password and account security settings.
      </p>

      {/* Change Password */}
      <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-5 lg:p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Change Password</h3>
            <p className="text-xs text-[var(--color-muted)]">Update your password regularly for better security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {passwordFields.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.name} className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text)]">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                    <Icon size={16} />
                  </span>
                  <input
                    type={f.show ? 'text' : 'password'}
                    {...register(f.name, { required: true })}
                    className="w-full rounded-xl text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] pl-11 pr-11 py-3 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all placeholder:text-[var(--color-muted-light)]"
                    placeholder={f.placeholder}
                  />
                  <button
                    type="button"
                    onClick={() => f.setShow(!f.show)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--color-muted)] flex items-center transition-colors duration-300 hover:text-[var(--color-text)]"
                  >
                    {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 self-start shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-1"
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* 2FA Placeholder */}
      <div className="rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-5 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-info-bg)] flex items-center justify-center text-[var(--color-info)]">
            <Smartphone size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[var(--color-text)]">Two-Factor Authentication</h3>
            <p className="text-xs text-[var(--color-muted)]">Add extra security to your account</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--color-muted-light)] text-[var(--color-muted)]">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  )
}