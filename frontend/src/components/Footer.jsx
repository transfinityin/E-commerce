import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-[var(--color-secondary)] text-[var(--color-muted-light)]/50 font-[DM_Sans,sans-serif]">

      {/* BRAND QUOTE SECTION */}
      <div className="relative overflow-hidden border-t border-b border-white/[0.06] py-10 sm:py-16 lg:py-20 px-4 sm:px-6 text-center bg-[var(--color-secondary)]">
        {/* Background subtle text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-[Playfair_Display,serif] text-5xl sm:text-8xl lg:text-[120px] font-black text-white/[0.02] tracking-[-0.05em]">
          INFINITY
        </div>

        <div className="relative z-10 max-w-[800px] mx-auto">

          {/* Tag line */}
          <p className="text-[9px] sm:text-[11px] tracking-[0.3em] text-[var(--color-primary)]/80 uppercase mb-4 sm:mb-7 font-semibold">
            ✦ BRAND PHILOSOPHY ✦
          </p>

          {/* Main quote */}
          <blockquote className="font-[Playfair_Display,serif] text-lg sm:text-2xl md:text-3xl lg:text-[38px] font-bold text-white leading-snug sm:leading-tight mb-3 sm:mb-6 italic">
            "Your limits exist only where your<br className="hidden sm:block" />
            <span className="text-[var(--color-primary)]">mindset ends.</span>"
          </blockquote>

          {/* Brand tagline */}
          <p className="text-[10px] sm:text-[13px] tracking-[0.25em] text-white/35 uppercase mb-5 sm:mb-10 font-medium">
            Beyond The Limits
          </p>

          {/* Divider */}
          <div className="w-10 sm:w-[60px] h-px bg-[var(--color-primary)] mx-auto mb-5 sm:mb-10" />

          {/* Brand description */}
          <p className="text-[11px] sm:text-sm lg:text-[15px] leading-relaxed sm:leading-[1.9] text-white/40 max-w-[620px] mx-auto mb-5 sm:mb-10 tracking-[0.02em] px-2 sm:px-0">
            <strong className="text-white/80 font-semibold">TRANSFINITY</strong> is not just a clothing brand —
            it is a movement built for creators, dreamers, leaders, and those who refuse to stay ordinary.
            Every piece is designed with premium quality, bold energy, and timeless aesthetics that represent
            <span className="text-[var(--color-primary)]"> limitless ambition.</span>
          </p>

          {/* Brand tags */}
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            {['Luxury', 'Culture', 'Identity', 'Infinity'].map(tag => (
              <span key={tag} className="px-2.5 sm:px-5 py-1 sm:py-1.5 border border-[var(--color-primary)]/30 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-primary)]/70 hover:border-[var(--color-primary)]/60 hover:text-[var(--color-primary)] transition-all duration-200 cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN FOOTER LINKS */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-[72px] pb-6 sm:pb-10">

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-10 lg:gap-12 mb-10 sm:mb-16">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="font-[Playfair_Display,serif] text-xl sm:text-[28px] font-bold text-white no-underline block mb-2">
              Trans<span className="text-[var(--color-primary)]">Finity</span>
            </Link>

            <p className="text-[9px] sm:text-[11px] tracking-[0.15em] text-white/25 uppercase mb-1.5">
              Beyond The Limits
            </p>
            <p className="text-[9px] sm:text-[11px] tracking-[0.1em] text-white/20 mb-4 sm:mb-6">
              Premium Streetwear Brand
            </p>

            <p className="text-[11px] sm:text-sm leading-relaxed mb-4 sm:mb-6 text-white/35">
              Luxury • Culture • Identity • Infinity
            </p>

            {/* Social icons */}
            <div className="flex gap-2 sm:gap-2.5">
              {[
                { icon: <FaInstagram size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Instagram' },
                { icon: <FaTwitter size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Twitter' },
                { icon: <FaYoutube size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'YouTube' },
                { icon: <Mail size={14} className="sm:w-4 sm:h-4" />, href: '#', label: 'Email' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 sm:w-9 sm:h-9 border border-white/10 rounded-full flex items-center justify-center text-white/40 no-underline transition-all duration-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products',  to: '/products' },
                { label: 'New Arrivals',  to: '/products?ordering=-created_at' },
                { label: 'Featured',      to: '/products?is_featured=true' },
                { label: 'Best Sellers',  to: '/products?ordering=-rating_avg' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In',    to: '/login' },
                { label: 'Register',   to: '/register' },
                { label: 'My Orders',  to: '/orders' },
                { label: 'Wishlist',   to: '/wishlist' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help Center', to: '/support' },
                { label: 'Contact Us',  to: '/contact' },
                { label: 'Returns',     to: '/returns' },
                { label: 'Shipping',    to: '/shipping' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Use',   to: '/terms' },
                { label: 'Cookie Policy',  to: '/cookies' },
                { label: 'Refund Policy',  to: '/refunds' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-white/25 mb-3 sm:mb-5">
                {col.title}
              </h4>
              <ul className="list-none flex flex-col gap-2 sm:gap-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[11px] sm:text-[13px] text-white/40 no-underline transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/[0.06] pt-5 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] sm:text-xs text-white/20 mb-1">
              TRANSFINITY © 2026 — All rights reserved.
            </p>
            <p className="text-[9px] sm:text-[11px] text-white/[0.12] tracking-[0.1em] uppercase">
              Beyond The Limits · Premium Streetwear Brand
            </p>
          </div>

          <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap justify-center">
            {['💳 Visa', '💳 Mastercard', '📱 UPI', '💰 Razorpay'].map(p => (
              <span
                key={p}
                className="text-[9px] sm:text-[11px] px-2 sm:px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-white/20"
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