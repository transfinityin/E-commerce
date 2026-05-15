import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'

const NOTIFICATION_SETTINGS = [
  { id: 'order_updates', label: 'Order Updates', desc: 'Get notified about your order status', icon: Bell, default: true },
  { id: 'promotional_emails', label: 'Promotional Emails', desc: 'Receive offers and discounts', icon: Mail, default: true },
  { id: 'sms_alerts', label: 'SMS Alerts', desc: 'Get SMS for important updates', icon: MessageSquare, default: false },
  { id: 'push_notifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Smartphone, default: true },
]

export default function Notifications({ onBack }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('notification_settings')
    return saved ? JSON.parse(saved) : {}
  })

  const toggleSetting = (id) => {
    const updated = { ...settings, [id]: !settings[id] }
    setSettings(updated)
    localStorage.setItem('notification_settings', JSON.stringify(updated))
    toast.success('Preference saved')
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
        Notifications
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
        Choose how you want to be notified.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {NOTIFICATION_SETTINGS.map((item) => {
          const Icon = item.icon
          const isEnabled = settings[item.id] ?? item.default
          
          return (
            <div key={item.id} className="flex items-center justify-between rounded-xl" style={{ 
              background: 'var(--color-bg-alt)', 
              border: '1px solid var(--color-border)', 
              padding: '16px 20px' 
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                  background: isEnabled ? 'var(--color-primary-light)' : 'var(--color-muted-light)', 
                  color: isEnabled ? 'var(--color-primary)' : 'var(--color-muted)' 
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</h3>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{item.desc}</p>
                </div>
              </div>
              
              <button
                onClick={() => toggleSetting(item.id)}
                className="relative w-12 h-6 rounded-full transition-all cursor-pointer border-none"
                style={{ 
                  background: isEnabled ? 'var(--color-primary)' : 'var(--color-muted-light)',
                }}
              >
                <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{
                  background: 'var(--color-surface)',
                  left: isEnabled ? '26px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}