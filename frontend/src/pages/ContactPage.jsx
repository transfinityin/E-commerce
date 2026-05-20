import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">Contact Us</h1>
        
        <div className="grid gap-6">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Email</h3>
              <p className="text-[var(--color-muted)]">support@transfinity.shop</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Phone</h3>
              <p className="text-[var(--color-muted)]">+91 98765 43210</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">Mon-Sat, 10AM - 7PM IST</p>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Address</h3>
              <p className="text-[var(--color-muted)]">
                Transfinity HQ<br />
                123 Fashion Street, T. Nagar<br />
                Chennai, Tamil Nadu 600017
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}