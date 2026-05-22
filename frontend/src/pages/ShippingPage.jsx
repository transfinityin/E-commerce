export default function ShippingPage() {
  const timings = [
    { city: 'Metro Cities', days: '2-3 business days' },
    { city: 'Tier 2 Cities', days: '3-5 business days' },
    { city: 'Remote Areas', days: '5-7 business days' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Delivery</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-6 sm:mb-8">Shipping Information</h1>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 sm:mb-4">Delivery Times</h3>
            <div className="divide-y divide-[var(--color-border)]">
              {timings.map((t, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 sm:py-3 first:pt-0 last:pb-0 gap-0.5 sm:gap-0">
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">{t.city}</span>
                  <span className="text-[11px] sm:text-sm text-[var(--color-muted)]">{t.days}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2">Shipping Charges</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">Free shipping on all orders above ₹499. Orders below ₹499 have a flat ₹49 shipping fee.</p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2">Order Tracking</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">Track your order in real-time through the tracking link sent to your email and SMS once the order is shipped.</p>
          </div>
        </div>
      </div>
    </div>
  )
}