import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const contacts = [
    { icon: Mail, label: 'Email', value: 'support@transfinity.shop' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', sub: 'Mon-Sat, 10AM - 7PM IST' },
    { icon: MapPin, label: 'Address', value: '123 Fashion Street, T. Nagar', sub: 'Chennai, Tamil Nadu 600017' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-16">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Get in Touch</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8">Contact Us</h1>
        
        <div className="space-y-4">
          {contacts.map((c, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <c.icon size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">{c.label}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">{c.value}</p>
                {c.sub && <p className="text-xs text-[var(--color-muted-light)] mt-1">{c.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}