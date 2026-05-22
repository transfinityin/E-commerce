export default function RefundsPage() {
  const methods = [
    { method: 'UPI / Wallets', days: '3-5 business days' },
    { method: 'Credit/Debit Cards', days: '5-7 business days' },
    { method: 'Net Banking', days: '5-7 business days' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">Payments</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-6 sm:mb-8">Refund Policy</h1>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2">Refund Eligibility</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">Refunds are processed for returned items that meet our return policy criteria. Prepaid orders are refunded to the original payment method.</p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 sm:mb-4">Refund Timeline</h3>
            <div className="divide-y divide-[var(--color-border)]">
              {methods.map((m, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 sm:py-3 first:pt-0 last:pb-0 gap-0.5 sm:gap-0">
                  <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">{m.method}</span>
                  <span className="text-[11px] sm:text-sm text-[var(--color-muted)]">{m.days}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2">COD Refunds</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">For Cash on Delivery returns, refunds are processed to your bank account via NEFT/IMPS within 7 business days after we receive the returned item.</p>
          </div>
        </div>
      </div>
    </div>
  )
}