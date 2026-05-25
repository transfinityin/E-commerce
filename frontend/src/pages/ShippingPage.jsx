export default function ShippingPage() {
  const timings = [
    { city: 'Metro Cities', days: '2-3 business days' },
    { city: 'Tier 2 Cities', days: '3-5 business days' },
    { city: 'Remote Areas', days: '5-7 business days' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-body">

      {/* ===== TRANSFINITY HEADER ===== */}
      <header className="nav-transfinity fixed top-0 left-0 right-0 z-50">
        <div className="page-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="text-gold text-2xl">∞</span>
            <span className="font-display text-gold text-sm tracking-[0.3em]">TRANSFINITY</span>
          </div>
          <nav className="hidden sm:flex gap-8">
            <a href="/" className="nav-link">HOME</a>
            <a href="/arcs" className="nav-link">ARCS</a>
            <a href="/shop" className="nav-link">SHOP</a>
            <a href="/founder" className="nav-link">FOUNDER</a>
          </nav>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* ===== MAIN CONTENT ===== */}
      <main className="page-container max-w-3xl py-8 sm:py-12 lg:py-16">

        {/* Page Header */}
        <div className="mb-8 sm:mb-12 animate-fadeUp">
          <p className="label-gold mb-3">DELIVERY</p>
          <h1 className="heading-section text-white">SHIPPING PROTOCOL</h1>
          <div className="divider-gold mt-6" />
        </div>

        {/* Content Cards */}
        <div className="space-y-4 sm:space-y-6">

          {/* Delivery Times */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Transit Times</h3>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {timings.map((t, i) => (
                <div 
                  key={i} 
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 first:pt-0 last:pb-0 gap-1 sm:gap-0 group"
                >
                  <span className="text-sm font-medium text-white tracking-wide">{t.city}</span>
                  <span className="text-xs sm:text-sm text-muted font-mono group-hover:text-gold transition-colors">
                    {t.days}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Charges */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Transit Charges</h3>
            </div>

            <p className="text-muted text-sm leading-relaxed mb-4">
              Complimentary transit on all orders above ₹499. Orders below ₹499 incur a flat 
              <span className="text-gold font-mono"> ₹49 </span> 
              transit fee.
            </p>

            <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg-alt)]">
              <p className="text-gold text-xs tracking-wider uppercase mb-1">Note</p>
              <p className="text-muted text-xs leading-relaxed">
                International transit is calculated at checkout based on destination coordinates 
                and artifact dimensions.
              </p>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Signal Tracking</h3>
            </div>

            <p className="text-muted text-sm leading-relaxed mb-4">
              Monitor your artifact in real-time through the tracking signal transmitted to your 
              registered email and communication channel once the order enters transit.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Real-time GPS coordinates of your package</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Transit milestone notifications</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Estimated arrival recalibration</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center animate-fadeUp" style={{ animationDelay: '0.4s' }}>
          <p className="text-muted text-sm mb-4">
            Transit inquiries? Contact our logistics channel.
          </p>
          <a 
            href="mailto:logistics@transfinity.shop" 
            className="inline-flex items-center gap-2 text-gold text-sm hover:text-gold-light transition-colors"
          >
            <span className="font-mono">logistics@transfinity.shop</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer-transfinity mt-16">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="label-gold mb-4">NAVIGATE</p>
              <div className="space-y-2">
                <a href="/shop" className="footer-link block">Shop All</a>
                <a href="/arcs" className="footer-link block">Arc Index</a>
                <a href="/manifesto" className="footer-link block">Manifesto</a>
              </div>
            </div>
            <div>
              <p className="label-gold mb-4">ACCOUNT</p>
              <div className="space-y-2">
                <a href="/login" className="footer-link block">Sign In</a>
                <a href="/register" className="footer-link block">Create Account</a>
              </div>
            </div>
            <div>
              <p className="label-gold mb-4">TRANSMIT</p>
              <div className="space-y-2">
                <a href="#" className="footer-link block">Instagram</a>
                <a href="#" className="footer-link block">Discord</a>
                <a href="#" className="footer-link block">X-Link</a>
              </div>
            </div>
          </div>
          <div className="divider-gold mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gold text-lg">∞</span>
              <span className="font-display text-gold text-xs tracking-[0.3em]">TRANSFINITY</span>
            </div>
            <p className="text-muted text-xs tracking-wider">
              LONDON // TOKYO // DIGITAL VOID
            </p>
            <p className="text-muted text-[10px]">
              © 2104 Transfinity Systems
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}