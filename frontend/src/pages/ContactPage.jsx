import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
          Get in Touch
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-6 sm:mb-8 lg:mb-10">
          Contact Us
        </h1>
        
        <div className="grid gap-3 sm:gap-4 lg:gap-6">
          {/* Email Card */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-300">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <Mail size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-0.5 sm:mb-1">Email</h3>
              <p className="text-xs sm:text-sm lg:text-base text-[var(--color-muted)] truncate">support@transfinity.shop</p>
            </div>
          </div>
          
          {/* Phone Card */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-300">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-0.5 sm:mb-1">Phone</h3>
              <p className="text-xs sm:text-sm lg:text-base text-[var(--color-muted)]">+91 98765 43210</p>
              <p className="text-[10px] sm:text-xs text-[var(--color-muted)] mt-0.5 sm:mt-1">Mon-Sat, 10AM - 7PM IST</p>
            </div>
          </div>
          
          {/* Address Card */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-4 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-300">
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <MapPin size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-0.5 sm:mb-1">Address</h3>
              <p className="text-xs sm:text-sm lg:text-base text-[var(--color-muted)] leading-relaxed">
                Transfinity HQ<br className="hidden sm:block" />
                <span className="sm:hidden">, </span>123 Fashion Street, T. Nagar<br className="hidden sm:block" />
                <span className="sm:hidden">, </span>Chennai, Tamil Nadu 600017
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}