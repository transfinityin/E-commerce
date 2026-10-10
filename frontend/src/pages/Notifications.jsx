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
    const updated = { ...settings, [id]: !currentValue }
    setSettings(updated)
    localStorage.setItem('notification_settings', JSON.stringify(updated))
    toast.success('Preference saved')
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)] ring-1 ring-black/5 sm:p-6 lg:p-8">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase transition hover:text-neutral-950"
        >
          <ArrowLeft size={14} />
          Back to profile
        </button>
      )}

      <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
        Preferences
      </p>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#F4F4F2] text-neutral-800">
          <Bell size={15} />
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
          Notifications
        </h2>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Choose how you want updates. Change these anytime.
      </p>

      <div className="flex flex-col gap-2.5">
        {NOTIFICATION_SETTINGS.map((item) => {
          const Icon = item.icon
          const isEnabled = settings[item.id] ?? item.default

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-[#F4F4F2]/80 px-4 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full transition ${
                    isEnabled
                      ? 'bg-neutral-950 text-white'
                      : 'bg-white text-neutral-400 ring-1 ring-black/6'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-950">{item.label}</h3>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{item.desc}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleSetting(item.id)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  isEnabled ? 'bg-neutral-950' : 'bg-neutral-300'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow transition ${
                    isEnabled ? 'left-[26px]' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-[#F4F4F2] px-4 py-3.5">
        <p className="text-xs leading-relaxed text-neutral-600">
          Tip: keep order updates and security alerts on so you never miss important account or
          purchase news.
        </p>
      </div>
    </div>
  )
}
