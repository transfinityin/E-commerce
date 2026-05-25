export default function TermsPage() {
  const sections = [
    { 
      title: '01. Acceptance of Terms', 
      content: 'By accessing and using Transfinity, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.' 
    },
    { 
      title: '02. User Accounts', 
      content: 'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.' 
    },
    { 
      title: '03. Product Information', 
      content: 'We strive for accuracy but do not warrant that product descriptions, pricing, or availability are always correct. Colors may vary slightly due to screen settings.' 
    },
    { 
      title: '04. Limitation of Liability', 
      content: 'Transfinity shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.' 
    },
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
          <p className="label-gold mb-3">LEGAL</p>
          <h1 className="heading-section text-white">TERMS OF USE</h1>
          <p className="text-muted text-sm mt-4">
            Protocols governing access to the Transfinity network and artifact acquisition.
          </p>
          <div className="divider-gold mt-6" />
        </div>

        {/* Terms Sections */}
        <div className="space-y-4 sm:space-y-6">
          {sections.map((s, i) => (
            <div 
              key={i} 
              className="card-dark p-5 sm:p-8 animate-fadeUp group"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 group-hover:border-gold transition-colors">
                  <span className="arc-number text-sm">{s.title.split('.')[0]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="heading-card text-sm sm:text-base mb-3">
                    {s.title.split('. ')[1]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {s.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center animate-fadeUp" style={{ animationDelay: '0.5s' }}>
          <p className="text-muted text-xs">
            Last updated: <span className="font-mono text-gold">Cycle 2104.05</span>
          </p>
          <p className="text-muted text-[10px] mt-2">
            These terms are subject to modification. Continued use constitutes acceptance.
          </p>
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