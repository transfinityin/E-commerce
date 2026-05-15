import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"

export default function Footer() {
  return (
    <footer style={{ background: '#0D0D0D', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── BRAND QUOTE SECTION ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 24px',
        textAlign: 'center',
        background: '#0a0a0a',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background subtle text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none',
          fontSize: '120px', fontWeight: 900,
          color: 'rgba(255,255,255,0.02)',
          fontFamily: 'Playfair Display, serif',
          letterSpacing: '-0.05em', userSelect: 'none',
        }}>
          INFINITY
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>

          {/* Tag line */}
          <p style={{
            fontSize: '11px', letterSpacing: '0.3em',
            color: 'rgba(200,169,110,0.8)', textTransform: 'uppercase',
            marginBottom: '28px', fontWeight: 600,
          }}>
            ✦ BRAND PHILOSOPHY ✦
          </p>

          {/* Main quote */}
          <blockquote style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(22px, 4vw, 38px)',
            fontWeight: 700, color: 'white',
            lineHeight: 1.3, marginBottom: '24px',
            fontStyle: 'italic',
          }}>
            "Your limits exist only where your<br />
            <span style={{ color: '#C8A96E' }}>mindset ends.</span>"
          </blockquote>

          {/* Brand tagline */}
          <p style={{
            fontSize: '13px', letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            marginBottom: '40px', fontWeight: 500,
          }}>
            Beyond The Limits
          </p>

          {/* Divider */}
          <div style={{
            width: '60px', height: '1px',
            background: '#C8A96E', margin: '0 auto 40px',
          }} />

          {/* Brand description */}
          <p style={{
            fontSize: '15px', lineHeight: 1.9,
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '620px', margin: '0 auto 40px',
            letterSpacing: '0.02em',
          }}>
            <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>TRANSFINITY</strong> is not just a clothing brand —
            it is a movement built for creators, dreamers, leaders, and those who refuse to stay ordinary.
            Every piece is designed with premium quality, bold energy, and timeless aesthetics that represent
            <span style={{ color: '#C8A96E' }}> limitless ambition.</span>
          </p>

          {/* Brand tags */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Luxury', 'Culture', 'Identity', 'Infinity'].map(tag => (
              <span key={tag} style={{
                padding: '6px 20px',
                border: '1px solid rgba(200,169,110,0.3)',
                borderRadius: '99px',
                fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(200,169,110,0.7)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER LINKS ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px 40px' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '48px', marginBottom: '64px',
        }}>

          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '28px', fontWeight: 700,
              color: 'white', textDecoration: 'none',
              display: 'block', marginBottom: '8px',
            }}>
              Trans<span style={{ color: '#C8A96E' }}>Finity</span>
            </Link>

            <p style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Beyond The Limits
            </p>
            <p style={{
              fontSize: '11px', letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.2)', marginBottom: '24px',
            }}>
              Premium Streetwear Brand
            </p>

            <p style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '24px', color: 'rgba(255,255,255,0.35)' }}>
              Luxury • Culture • Identity • Infinity
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <FaInstagram size={16} />, href: '#', label: 'Instagram' },
                { icon: <FaTwitter   size={16} />, href: '#', label: 'Twitter' },
                { icon: <FaYoutube   size={16} />, href: '#', label: 'YouTube' },
                { icon: <Mail        size={16} />, href: '#', label: 'Email' },
              ].map((s, i) => (
                <a key={i} href={s.href} aria-label={s.label} style={{
                  width: '36px', height: '36px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#C8A96E'
                  e.currentTarget.style.color = '#C8A96E'
                  e.currentTarget.style.background = 'rgba(200,169,110,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                  e.currentTarget.style.background = 'transparent'
                }}>
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
              <h4 style={{
                fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)', marginBottom: '20px',
              }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} style={{
                      fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '32px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginBottom: '4px' }}>
              TRANSFINITY © 2026 — All rights reserved.
            </p>
            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.12)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Beyond The Limits · Premium Streetwear Brand
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['💳 Visa', '💳 Mastercard', '📱 UPI', '💰 Razorpay'].map(p => (
              <span key={p} style={{
                fontSize: '11px', padding: '4px 10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.2)',
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}