import { Link } from 'react-router-dom'
import { Mail, MapPin, Globe } from 'lucide-react'
import { FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6'
export default function Footer() {
  return (
    <footer className="bg-black border-t border-gold/10 font-body">

      {/* ==================== ENCRYPTED TRANSMISSION (QUOTE) ==================== */}
      <div className="relative overflow-hidden py-16 sm:py-20 lg:py-28 px-4 sm:px-6 text-center">
        {/* Background subtle text */}
        {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none 
          font-display text-xl sm:text-8xl lg:text-[140px] font-bold text-gold/[0.02] tracking-[0.1em]">
          TRANSFINITY
        </div> */}

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-10" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Tag line */}
          <p className="label-gold mb-6 sm:mb-8">
            ✦ ENCRYPTED TRANSMISSION ✦
          </p>

          {/* Main quote */}
          <blockquote className="font-display text-lg sm:text-2xl md:text-3xl lg:text-[36px] font-normal 
            text-white leading-relaxed sm:leading-tight mb-4 sm:mb-6 tracking-wide">
            "If you can read this, you have already<br className="hidden sm:block" />
            <span className="text-gradient-gold"> crossed.</span> The next arc opens<br className="hidden sm:block" />
            when you stop counting."
          </blockquote>

          {/* Divider */}
          <div className="divider-gold w-16 sm:w-24 mx-auto mb-6 sm:mb-8" />

          {/* Brand description */}
          <p className="text-[11px] sm:text-sm lg:text-[15px] leading-relaxed sm:leading-[1.9] 
            text-muted max-w-[600px] mx-auto mb-6 sm:mb-10 tracking-wide px-2 sm:px-0">
            <strong className="text-white/80 font-display tracking-wider">TRANSFINITY</strong> is not just a clothing brand —
            it is a movement built for those who exist between recorded moments.
            Every garment is designed as a relic — a piece of equipment for the wanderer
            who refuses to be <span className="text-gold">located.</span>
          </p>

          {/* Brand tags */}
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            {['Luxury', 'Culture', 'Identity', 'Infinity'].map(tag => (
              <span key={tag} 
                className="px-3 sm:px-5 py-1.5 sm:py-2 border border-gold/20 text-[9px] sm:text-[11px] 
                  font-mono tracking-[0.2em] uppercase text-gold/60 hover:border-gold/40 hover:text-gold 
                  transition-all duration-300 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== MAIN FOOTER NAVIGATION ==================== */}
      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="no-underline block mb-3">
              <span className="font-display text-xl sm:text-2xl text-white tracking-[0.2em]">
                TRANS<span className="text-gold">FINITY</span>
              </span>
            </Link>

            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] text-muted uppercase mb-1">
              London // Tokyo // Digital Void
            </p>
            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-muted/50 mb-6 sm:mb-8">
              © 2104 Transfinity Systems
            </p>

            <p className="text-[11px] sm:text-xs font-mono tracking-wider text-muted/60 mb-6 sm:mb-8">
              Luxury • Culture • Identity • Infinity
            </p>

            {/* Social icons - TRANSFINITY style */}
            <div className="flex gap-2 sm:gap-3">
              {[
                { icon: <FaInstagram size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Instagram' },
                { icon: <FaXTwitter size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Twitter' },
                { icon: <FaYoutube size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'YouTube' },
                { icon: <Mail size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Email' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-gold/20 flex items-center justify-center 
                    text-muted no-underline transition-all duration-300 hover:border-gold/50 
                    hover:text-gold hover:bg-gold/5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[{
              title: 'Navigate',
              links: [
                { label: 'Shop All',     to: '/products' },
                { label: 'Arc Index',    to: '/arcs' },
                { label: 'Manifesto',    to: '/founder' },
                { label: 'New Signals',  to: '/products?ordering=-created_at' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In',      to: '/login' },
                { label: 'Create Account', to: '/register' },
                { label: 'My Orders',    to: '/orders' },
                { label: 'Wishlist',     to: '/wishlist' },
              ],
            },
            {
              title: 'Transmit',
              links: [
                { label: 'Instagram',    href: '#' },
                { label: 'Discord',      href: '#' },
                { label: 'X-Link',       href: '#' },
                { label: 'Signal',       href: '#' },
              ],
            },
            {
              title: 'Systems',
              links: [
                { label: 'Privacy Protocol', to: '/privacy' },
                { label: 'Terms of Use',     to: '/terms' },
                { label: 'Cookie Policy',    to: '/cookies' },
                { label: 'Refund Policy',    to: '/refunds' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-gold/60 mb-4 sm:mb-6">
                {col.title}
              </h4>
              <ul className="list-none flex flex-col gap-2.5 sm:gap-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-[11px] sm:text-[13px] text-muted no-underline 
                          transition-colors duration-300 hover:text-gold tracking-wide"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[11px] sm:text-[13px] text-muted no-underline 
                          transition-colors duration-300 hover:text-gold tracking-wide"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ==================== BOTTOM BAR ==================== */}
        <div className="border-t border-gold/10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-xs font-mono tracking-wider text-muted/40 mb-1">
              TRANSFINITY.SHOP
            </p>
            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-muted/25 uppercase">
              LAT 35.6895°N // LONG 139.6917°E
            </p>
          </div>

          {/* Payment methods - styled as system tags */}
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap justify-center">
            {['VISA', 'MASTERCARD', 'UPI', 'RAZORPAY'].map(p => (
              <span
                key={p}
                className="text-[9px] sm:text-[10px] font-mono tracking-wider px-2.5 sm:px-3 py-1 
                  bg-gold/5 border border-gold/10 text-muted/40"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}