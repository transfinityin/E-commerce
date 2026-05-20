export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect personal information such as name, email, phone number, shipping address, and payment details to process your orders and improve your shopping experience.'
    },
    {
      title: 'How We Use Your Data',
      list: ['Process and deliver your orders', 'Send order updates and promotional offers (with consent)', 'Improve our website and services', 'Prevent fraud and ensure security']
    },
    {
      title: 'Data Security',
      content: 'We use industry-standard encryption and security measures to protect your data. We never store your full card details — all payments are processed through secure PCI-DSS compliant gateways.'
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-16">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">Last updated: May 2026</p>
        
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-6">
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">{s.title}</h3>
              {s.content && <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.content}</p>}
              {s.list && (
                <ul className="list-disc list-inside text-sm text-[var(--color-muted)] space-y-1.5">
                  {s.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}