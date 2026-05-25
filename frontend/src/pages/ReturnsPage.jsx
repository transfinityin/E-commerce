export default function ReturnsPage() {
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
          <p className="label-gold mb-3">AFTER PURCHASE</p>
          <h1 className="heading-section text-white">RETURNS & EXCHANGES</h1>
          <div className="divider-gold mt-6" />
        </div>

        {/* Content Cards */}
        <div className="space-y-4 sm:space-y-6">

          {/* Return Policy */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Return Protocol</h3>
            </div>

            <p className="text-muted text-sm leading-relaxed mb-5">
              You may return artifacts within 7 days of delivery for a full refund or exchange. 
              All returns are subject to verification.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">◆</span>
                <span>Artifacts must be unworn with original sigils attached</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">◆</span>
                <span>Intimate wear, undergarments, and accessories cannot be returned</span>
              </li>
              <li className="flex items-start gap-3 text-muted text-sm">
                <span className="text-gold mt-1 text-xs">◆</span>
                <span>Limited drop artifacts are final acquisition (no returns)</span>
              </li>
            </ul>
          </div>

          {/* How to Return */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Return Sequence</h3>
            </div>

            <div className="space-y-4">
              {[
                { step: '01', text: 'Navigate to My Orders and select the artifact' },
                { step: '02', text: 'Initiate "Return Artifact" and specify reason' },
                { step: '03', text: 'Secure the artifact in original packaging' },
                { step: '04', text: 'Transfer to pickup operative or designated drop point' },
                { step: '05', text: 'Refund processed within 5-7 business cycles' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 group-hover:border-gold transition-colors">
                    <span className="arc-number text-sm">{item.step}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed pt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exchange Info */}
          <div className="card-dark p-5 sm:p-8 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                <span className="text-gold text-xs">◆</span>
              </div>
              <h3 className="heading-card text-sm sm:text-base">Exchange Protocol</h3>
            </div>

            <p className="text-muted text-sm leading-relaxed mb-4">
              Exchanges are available for size variations only. If your desired size is unavailable, 
              a refund will be issued automatically.
            </p>

            <div className="border border-[var(--color-border)] p-4 bg-[var(--color-bg-alt)]">
              <p className="text-gold text-xs tracking-wider uppercase mb-2">Note</p>
              <p className="text-muted text-xs leading-relaxed">
                Limited edition and founder-exclusive artifacts cannot be exchanged. 
                Each piece is uniquely calibrated to its original recipient.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center animate-fadeUp" style={{ animationDelay: '0.4s' }}>
          <p className="text-muted text-sm mb-4">
            Require assistance with your return? Contact our support channel.
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