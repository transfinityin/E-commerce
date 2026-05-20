export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing and using Transfinity, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.' },
    { title: '2. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.' },
    { title: '3. Product Information', content: 'We strive for accuracy but do not warrant that product descriptions, pricing, or availability are always correct. Colors may vary slightly due to screen settings.' },
    { title: '4. Limitation of Liability', content: 'Transfinity shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-16">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8">Terms of Use</h1>
        
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}