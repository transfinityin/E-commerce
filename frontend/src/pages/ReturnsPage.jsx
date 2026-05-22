export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2">After Purchase</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-6 sm:mb-8">Returns & Exchanges</h1>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2 sm:mb-3">Return Policy</h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-2 sm:mb-3 leading-relaxed">You can return items within 7 days of delivery for a full refund or exchange.</p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--color-muted)] space-y-1 sm:space-y-1.5">
              <li>Items must be unused with original tags attached</li>
              <li>Intimate wear, socks, and accessories cannot be returned</li>
              <li>Sale items are final sale (no returns)</li>
            </ul>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-2 sm:mb-3">How to Return</h3>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-[var(--color-muted)] space-y-1 sm:space-y-1.5">
              <li>Go to My Orders and select the item</li>
              <li>Click "Return Item" and select reason</li>
              <li>Pack the item in original packaging</li>
              <li>Hand over to pickup executive or drop at nearest center</li>
              <li>Refund processed within 5-7 business days</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}