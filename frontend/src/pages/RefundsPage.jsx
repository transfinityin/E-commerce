export default function RefundsPage() {
  const methods = [
    { method: 'UPI / Wallets', days: '3-5 business days' },
    { method: 'Credit/Debit Cards', days: '5-7 business days' },
    { method: 'Net Banking', days: '5-7 business days' },
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
          <p className="label-gold mb-3">PAYMENTS</p>
          <h1 className="heading-section text-white">REFUND POLICY</h1>
          <div className="divider-gold mt-6" />
        </div>

        {/* Content Cards */}
        <div className="space-y-4 sm:space-y-6">

          {/* Refund Eligibility */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Refund Eligibility</h3>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Refunds are processed for returned artifacts that meet our return protocol criteria. 
              Prepaid orders are refunded to the original payment method.
            </p>
          </div>

          {/* Refund Timeline */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Refund Timeline</h3>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {methods.map((m, i) => (
                <div 
                  key={i} 
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 first:pt-0 last:pb-0 gap-1 sm:gap-0 group"
                >
                  <span className="text-sm font-medium text-white tracking-wide">{m.method}</span>
                  <span className="text-xs sm:text-sm text-muted font-mono group-hover:text-gold transition-colors">
                    {m.days}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COD Refunds */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">COD Refunds</h3>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              For Cash on Delivery returns, refunds are processed to your bank account via NEFT/IMPS 
              within 7 business days after we receive the returned artifact.
            </p>
          </div>

          {/* Additional Info */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Processing Protocol</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Refund initiation occurs within 24 hours of return acceptance</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Bank processing times vary by institution</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">→</span>
                <span>Contact support for delays exceeding stated timelines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center animate-fadeUp" style={{ animationDelay: '0.5s' }}>
          <p className="text-muted text-sm mb-4">
            Questions about your refund? Contact our support channel.
          </p>
          <a 
            href="mailto:support@transfinity.shop" 
            className="inline-flex items-center gap-2 text-gold text-sm hover:text-gold-light transition-colors"
          >
            <span className="font-mono">signal@transfinity.shop</span>
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