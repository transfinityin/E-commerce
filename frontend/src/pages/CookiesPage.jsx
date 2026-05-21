export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="page-container max-w-3xl py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-1.5 sm:mb-2">
          Legal
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] tracking-tight mb-6 sm:mb-8 lg:mb-10">
          Cookie Policy
        </h1>
        
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* What Are Cookies */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-1.5 sm:mb-2">
              What Are Cookies?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-[var(--color-muted)] leading-relaxed">
              Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience.
            </p>
          </div>
          
          {/* Types of Cookies */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-2 sm:mb-3">
              Types of Cookies We Use
            </h3>
            <ul className="list-disc list-inside text-xs sm:text-sm lg:text-base text-[var(--color-muted)] space-y-1 sm:space-y-1.5">
              <li>
                <span className="font-medium text-[var(--color-text)]">Essential:</span> Required for the website to function (cart, login)
              </li>
              <li>
                <span className="font-medium text-[var(--color-text)]">Analytics:</span> Help us understand how visitors use our site
              </li>
              <li>
                <span className="font-medium text-[var(--color-text)]">Marketing:</span> Used to deliver relevant ads and offers
              </li>
            </ul>
          </div>
          
          {/* Managing Cookies */}
          <div className="bg-[var(--color-surface)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--color-text)] mb-1.5 sm:mb-2">
              Managing Cookies
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-[var(--color-muted)] leading-relaxed">
              You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}