import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Volume2, Tag, ShieldCheck } from 'lucide-react'

const NOTIFICATION_SETTINGS = [
  { id: 'order_updates', label: 'Order Updates', desc: 'Get notified about your order status', icon: Bell, default: true },
  { id: 'promotional_emails', label: 'Promotional Emails', desc: 'Receive offers and discounts', icon: Tag, default: true },
  { id: 'sms_alerts', label: 'SMS Alerts', desc: 'Get SMS for important updates', icon: MessageSquare, default: false },
  { id: 'push_notifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Volume2, default: true },
  { id: 'security_alerts', label: 'Security Alerts', desc: 'Login and security notifications', icon: ShieldCheck, default: true },
  { id: 'newsletter', label: 'Newsletter', desc: 'Weekly style inspiration and new drops', icon: Mail, default: false },
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
          <Bell size={16} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Notifications
        </h2>
      </div>
      <p className="text-sm text-[var(--color-muted)] mb-8">
        Choose how you want to be notified. You can update these preferences anytime.
      </p>

      <div className="flex flex-col gap-3">
        {NOTIFICATION_SETTINGS.map((item) => {
          const Icon = item.icon
          const isEnabled = settings[item.id] ?? item.default

          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isEnabled
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'bg-[var(--color-bg)] text-[var(--color-muted)]'
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)]">{item.label}</h3>
                  <p className="text-xs text-[var(--color-muted)]">{item.desc}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleSetting(item.id)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer border-none ${
                  isEnabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-muted-light)]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--color-surface)] shadow-sm transition-all duration-300 ${
                    isEnabled ? 'left-[26px]' : 'left-[2px]'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--color-primary-light)]/50 border border-[var(--color-primary)]/20">
        <p className="text-xs text-[var(--color-primary-dark)] leading-relaxed">
          <strong>Tip:</strong> Keeping order updates and security alerts enabled ensures you never miss important information about your account and purchases.
        </p>
      </div>
    </div>
  )
}