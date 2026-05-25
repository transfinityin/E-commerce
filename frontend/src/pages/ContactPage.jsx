import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowRight, Radio } from 'lucide-react'

export default function ContactPage() {
  const contacts = [
    {
      icon: Mail,
      label: 'Signal',
      value: 'support@transfinity.shop',
      sub: 'Response within 24 hours',
      href: 'mailto:support@transfinity.shop',
    },
    {
      icon: Phone,
      label: 'Comm Link',
      value: '+91 98765 43210',
      sub: 'Mon-Sat, 10AM - 7PM IST',
      href: 'tel:+919876543210',
    },
    {
      icon: MapPin,
      label: 'Coordinates',
      value: '123 Fashion Street, T. Nagar',
      sub: 'Chennai, Tamil Nadu 600017',
      href: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] text-white overflow-x-hidden">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <section className="mb-10 sm:mb-14 text-center animate-fadeUp">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border border-gold/25 bg-gold/5 flex items-center justify-center mx-auto mb-5">
            <Radio size={22} className="text-gold" />
          </div>

          <p className="label-gold mb-3">Transmit</p>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight mb-4">
            CONTACT <span className="text-gradient-gold">NETWORK</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-muted font-mono tracking-wider leading-relaxed max-w-2xl mx-auto">
            Establish communication with the Transfinity network. All signals are encrypted,
            routed, and monitored for faster response.
          </p>

          <div className="divider-gold w-40 mx-auto mt-6" />
        </section>

        {/* Contact Cards */}
        <section className="space-y-4 sm:space-y-5">
          {contacts.map((contact, index) => {
            const Icon = contact.icon

            return (
              <a
                key={contact.label}
                href={contact.href}
                className="group card-dark p-5 sm:p-6 lg:p-8 flex items-start gap-4 sm:gap-6 animate-fadeUp"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 border border-gold/20 bg-black flex items-center justify-center shrink-0 group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
                  <Icon size={21} className="text-gold" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="label-gold text-[10px] mb-2">{contact.label}</p>

                  <p className="text-white text-sm sm:text-base lg:text-lg font-mono tracking-wider break-words">
                    {contact.value}
                  </p>

                  {contact.sub && (
                    <p className="text-muted text-xs sm:text-sm font-mono tracking-wider leading-relaxed mt-1">
                      {contact.sub}
                    </p>
                  )}
                </div>

                <div className="hidden sm:flex items-center text-muted group-hover:text-gold transition-colors duration-300">
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </a>
            )
          })}
        </section>

        {/* Additional Info */}
        <section
          className="mt-10 sm:mt-12 card-dark p-5 sm:p-6 lg:p-8 animate-fadeUp"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 border border-gold/20 bg-gold/5 flex items-center justify-center shrink-0">
              <span className="text-gold text-xs">◆</span>
            </div>

            <h2 className="heading-card text-white text-sm sm:text-base">
              Communication Protocol
            </h2>
          </div>

          <ul className="space-y-3">
            {[
              'All inquiries are logged and assigned a tracking identifier.',
              'Priority response for registered wanderers and arc members.',
              'Emergency signals are reviewed outside standard support windows.',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-muted text-xs sm:text-sm font-mono tracking-wider leading-relaxed"
              >
                <span className="text-gold mt-1 text-xs shrink-0">◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Bottom CTA */}
        <section className="mt-10 sm:mt-14 text-center">
          <div className="divider-gold mb-6" />

          <p className="text-[10px] sm:text-xs text-muted font-mono tracking-[0.18em] uppercase leading-relaxed">
            Transfinity Systems // London // Tokyo // Digital Void
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              SHOP ARTIFACTS
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/orders"
              className="btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              VIEW ORDERS
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}