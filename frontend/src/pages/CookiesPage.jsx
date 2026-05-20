export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-16">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-8">Cookie Policy</h1>
        
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">What Are Cookies?</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience.</p>
          </div>
          
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Types of Cookies We Use</h3>
            <ul className="list-disc list-inside text-sm text-[var(--color-muted)] space-y-1.5">
              <li><span className="font-medium text-[var(--color-text)]">Essential:</span> Required for the website to function (cart, login)</li>
              <li><span className="font-medium text-[var(--color-text)]">Analytics:</span> Help us understand how visitors use our site</li>
              <li><span className="font-medium text-[var(--color-text)]">Marketing:</span> Used to deliver relevant ads and offers</li>
            </ul>
          </div>
          
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">Managing Cookies</h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.</p>
          </div>
        </div>
      </div>
    </div>
  )
}