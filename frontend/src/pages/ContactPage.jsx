import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const contacts = [
    { icon: Mail, label: 'Email', value: 'support@transfinity.shop' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', sub: 'Mon-Sat, 10AM - 7PM IST' },
    { icon: MapPin, label: 'Address', value: '123 Fashion Street, T. Nagar', sub: 'Chennai, Tamil Nadu 600017' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Get in Touch</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-6 sm:mb-8">Contact Us</h1>

        <div className="space-y-3 sm:space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <c.icon size={16} className="sm:w-5 sm:h-5 text-[var(--color-primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-text)]">{c.label}</h3>
                <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-0.5 break-all">{c.value}</p>
                {c.sub && <p className="text-[10px] sm:text-xs text-[var(--color-muted-light)] mt-1">{c.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}