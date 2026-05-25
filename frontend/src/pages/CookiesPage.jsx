export default function CookiesPage() {
  const sections = [
    {
      title: 'What Are Cookies?',
      content:
        'Cookies are small text files stored on your device when you visit our website. They help us provide a better browsing experience, remember preferences, and keep essential features working smoothly.',
    },
    {
      title: 'Types of Cookies We Use',
      isList: true,
      items: [
        {
          label: 'Essential',
          desc: 'Required for core website features such as cart, login, checkout, and account security.',
        },
        {
          label: 'Analytics',
          desc: 'Help us understand how visitors interact with our site so we can improve performance and usability.',
        },
        {
          label: 'Marketing',
          desc: 'Used to deliver relevant offers, product drops, and promotional messages.',
        },
      ],
    },
    {
      title: 'Managing Cookies',
      content:
        'You can control or disable cookies through your browser settings. Disabling essential cookies may affect login, cart, checkout, and other important site functionality.',
    },
  ]

  return (
    <div className="min-h-screen bg-black pt-[76px] sm:pt-[88px] lg:pt-[96px] overflow-x-hidden">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <section className="mb-10 sm:mb-14 lg:mb-16 animate-fadeUp">
          <p className="label-gold mb-3">Legal Protocol</p>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl text-white tracking-[0.12em] leading-tight mb-4">
            COOKIE <span className="text-gradient-gold">POLICY</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-muted font-mono tracking-wider leading-relaxed max-w-2xl">
            Transparency in how Transfinity uses cookies and similar technologies to
            enhance your browsing experience.
          </p>

          <div className="divider-gold w-32 mt-6" />
        </section>

        {/* Policy Sections */}
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

              {section.isList && (
                <ul className="space-y-3 sm:space-y-4">
                  {section.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-black border border-gold/10 hover:border-gold/35 transition-all duration-300"
                    >
                      <span className="text-gold mt-1 shrink-0">◆</span>

                      <div className="min-w-0">
                        <p className="text-sm sm:text-base text-white font-mono tracking-wider">
                          {item.label}
                        </p>
                        <p className="text-xs sm:text-sm text-muted font-mono tracking-wider leading-relaxed mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        {/* Footer Note */}
        <section
          className="mt-10 sm:mt-14 lg:mt-16 animate-fadeUp"
          style={{ animationDelay: '0.55s' }}
        >
          <div className="divider-gold mb-6" />

          <p className="text-[10px] sm:text-xs text-muted font-mono tracking-[0.18em] leading-relaxed text-center uppercase">
            Last updated: Year 2104 // Transfinity Systems. Your data sovereignty is respected.
          </p>
        </section>
      </main>
    </div>
  )
}