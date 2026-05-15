import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Key, Shield, Smartphone, Eye, EyeOff } from 'lucide-react'
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

  return (
    <div className="rounded-2xl shadow-sm" style={{ 
      background: 'var(--color-surface)', 
      border: '1px solid var(--color-border)', 
      padding: '32px' 
    }}>
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center text-sm font-medium border-none cursor-pointer" style={{ 
        color: 'var(--color-muted)', 
        marginBottom: '24px', 
        gap: '8px', 
        background: 'transparent' 
      }}>
        <ArrowLeft size={18} /> Back to Profile
      </button>

      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
        Security
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
        Manage your password and account security.
      </p>

      {/* Change Password */}
      <div className="rounded-xl" style={{ 
        background: 'var(--color-bg-alt)', 
        border: '1px solid var(--color-border)', 
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Change Password</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Update your password regularly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Old Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Current Password</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                {...register('old_password', { required: true })}
                className="w-full rounded-xl text-sm outline-none"
                style={{ padding: '12px 16px', paddingRight: '40px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 border-none cursor-pointer" style={{ background: 'transparent', color: 'var(--color-muted)' }}>
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                {...register('new_password', { required: true })}
                className="w-full rounded-xl text-sm outline-none"
                style={{ padding: '12px 16px', paddingRight: '40px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 border-none cursor-pointer" style={{ background: 'transparent', color: 'var(--color-muted)' }}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('new_password2', { required: true })}
                className="w-full rounded-xl text-sm outline-none"
                style={{ padding: '12px 16px', paddingRight: '40px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                placeholder="Confirm new password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 border-none cursor-pointer" style={{ background: 'transparent', color: 'var(--color-muted)' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm font-semibold rounded-xl border-none cursor-pointer"
            style={{ 
              padding: '12px 24px', 
              background: 'var(--color-primary)', 
              color: 'var(--color-text-inverse)',
              opacity: isSubmitting ? 0.5 : 1,
              alignSelf: 'flex-start'
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 2FA Placeholder */}
      <div className="rounded-xl" style={{ 
        background: 'var(--color-bg-alt)', 
        border: '1px solid var(--color-border)', 
        padding: '24px' 
      }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <Smartphone size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Two-Factor Authentication</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Add extra security to your account</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'var(--color-muted-light)', color: 'var(--color-muted)' }}>
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  )
}