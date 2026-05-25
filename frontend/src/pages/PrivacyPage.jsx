export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content:
        'We collect personal information such as name, email, phone number, shipping address, and payment details to process your orders and improve your shopping experience.',
    },
    {
      title: 'How We Use Your Data',
      list: [
        'Process and deliver your orders',
        'Send order updates and promotional offers with consent',
        'Improve our website, performance, and customer experience',
        'Prevent fraud and protect account security',
      ],
    },
    {
      title: 'Data Security',
      content:
        'We use industry-standard encryption and security measures to protect your data. We never store your full card details. Payments are processed through secure payment gateways.',
    },
  ]

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <section className="mb-10 sm:mb-14 animate-fadeUp">
          <p className="label-gold mb-3">Legal Protocol</p>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight mb-4">
            PRIVACY <span className="text-gradient-gold">POLICY</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed">
            Last updated: May 2026
          </p>

          <div className="divider-gold w-32 mt-6" />
        </section>

        {/* Sections */}
        <section className="space-y-4 sm:space-y-5 lg:space-y-6">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className="card-dark p-5 sm:p-6 lg:p-8 animate-fadeUp group"
              style={{ animationDelay: `${(index + 1) * 0.12}s` }}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="arc-number text-lg sm:text-xl">
                  0{index + 1}
                </span>
                <div className="h-px flex-1 bg-gold/15 group-hover:bg-gold/40 transition-colors duration-300" />
              </div>

              <h2 className="heading-card text-gold mb-3 sm:mb-4">
                {section.title}
              </h2>

              {section.content && (
                <p className="text-sm sm:text-base text-muted font-mono tracking-wider leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-3">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm sm:text-base text-muted font-mono tracking-wider leading-relaxed"
                    >
                      <span className="text-gold mt-1 shrink-0">◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        {/* Footer */}
        <section className="mt-10 sm:mt-14">
          <div className="divider-gold mb-6" />

          <p className="text-[10px] sm:text-xs text-muted font-mono tracking-[0.18em] leading-relaxed text-center uppercase">
            Transfinity Systems // Your information is handled with controlled access and protected transmission.
          </p>
        </section>
      </main>
    </div>
  )
}