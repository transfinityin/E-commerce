import { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Volume2,
  Tag,
  ShieldCheck,
} from 'lucide-react'

const NOTIFICATION_SETTINGS = [
  {
    id: 'order_updates',
    label: 'Order Updates',
    desc: 'Get notified about your order status',
    icon: Bell,
    default: true,
  },
  {
    id: 'promotional_emails',
    label: 'Promotional Emails',
    desc: 'Receive offers, drops, and discounts',
    icon: Tag,
    default: true,
  },
  {
    id: 'sms_alerts',
    label: 'SMS Alerts',
    desc: 'Get SMS for important updates',
    icon: MessageSquare,
    default: false,
  },
  {
    id: 'push_notifications',
    label: 'Push Notifications',
    desc: 'Browser push notifications',
    icon: Volume2,
    default: true,
  },
  {
    id: 'security_alerts',
    label: 'Security Alerts',
    desc: 'Login and security notifications',
    icon: ShieldCheck,
    default: true,
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    desc: 'Weekly style inspiration and new drops',
    icon: Mail,
    default: false,
  },
]

export default function Notifications({ onBack }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('notification_settings')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleSetting = (id) => {
    const currentItem = NOTIFICATION_SETTINGS.find((item) => item.id === id)
    const currentValue = settings[id] ?? currentItem?.default ?? false

    const updated = {
      ...settings,
      [id]: !currentValue,
    }

    setSettings(updated)
    localStorage.setItem('notification_settings', JSON.stringify(updated))
    toast.success('Preference saved')
  }

  return (
    <div className="bg-[#0A0A0A] border border-gold/15 p-4 sm:p-6 lg:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider uppercase text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer mb-6"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="label-gold mb-3">Transmission Settings</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 border border-gold/20 bg-gold/10 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-gold" />
          </div>

          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-white tracking-[0.12em]">
            NOTIFICATIONS
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
          Choose how you want to receive updates. You can change these preferences anytime.
        </p>
      </div>

      <div className="divider-gold mb-6 sm:mb-8" />

      {/* Settings */}
      <div className="flex flex-col gap-3">
        {NOTIFICATION_SETTINGS.map((item) => {
          const Icon = item.icon
          const isEnabled = settings[item.id] ?? item.default

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 bg-black border border-gold/12 hover:border-gold/35 p-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isEnabled
                      ? 'bg-gold/10 border border-gold/25 text-gold'
                      : 'bg-[#0A0A0A] border border-gold/10 text-muted'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-mono tracking-wider text-white">
                    {item.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted font-mono tracking-wider leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggleSetting(item.id)}
                className={`relative w-12 h-6 shrink-0 transition-all duration-300 border ${
                  isEnabled
                    ? 'bg-gold border-gold'
                    : 'bg-[#111111] border-gold/20'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-black shadow-sm transition-all duration-300 ${
                    isEnabled ? 'left-[25px]' : 'left-[2px]'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-gold/10 border border-gold/20">
        <p className="text-xs text-gold font-mono tracking-wider leading-relaxed">
          <strong>Tip:</strong> Keep order updates and security alerts enabled so you never miss
          important information about your account or purchases.
        </p>
      </div>
    </div>
  )
}