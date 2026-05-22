/**
 * Color Palette Reference Component
 * Use this to verify colors are rendering correctly
 * Remove from production
 */

export default function ColorPaletteReference() {
  const colors = [
    { name: 'Primary (Emerald)', hex: '#059669', css: 'bg-[var(--color-primary)]' },
    { name: 'Primary Light', hex: '#D1FAE5', css: 'bg-[var(--color-primary-light)]' },
    { name: 'Primary Dark', hex: '#047857', css: 'bg-[var(--color-primary-dark)]' },
    { name: 'Secondary', hex: '#18181B', css: 'bg-[var(--color-secondary)]' },
    { name: 'Secondary Light', hex: '#27272A', css: 'bg-[var(--color-secondary-light)]' },
    { name: 'Background', hex: '#FAFAFA', css: 'bg-[var(--color-bg)]' },
    { name: 'Background Alt', hex: '#F4F4F5', css: 'bg-[var(--color-bg-alt)]' },
    { name: 'Surface', hex: '#FFFFFF', css: 'bg-[var(--color-surface)]' },
    { name: 'Text', hex: '#18181B', css: 'bg-[var(--color-text)]' },
    { name: 'Text Inverse', hex: '#FFFFFF', css: 'bg-[var(--color-text-inverse)]' },
    { name: 'Muted', hex: '#71717A', css: 'bg-[var(--color-muted)]' },
    { name: 'Muted Light', hex: '#A1A1AA', css: 'bg-[var(--color-muted-light)]' },
    { name: 'Border', hex: '#E4E4E7', css: 'bg-[var(--color-border)]' },
    { name: 'Success', hex: '#059669', css: 'bg-[var(--color-success)]' },
    { name: 'Danger', hex: '#DC2626', css: 'bg-[var(--color-danger)]' },
    { name: 'Warning', hex: '#D97706', css: 'bg-[var(--color-warning)]' },
    { name: 'Info', hex: '#2563EB', css: 'bg-[var(--color-info)]' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-[var(--color-text)] mb-2">
          Color Palette Reference
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-muted)] mb-8 sm:mb-12">
          Visual reference for all design system colors. Remove this component in production.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {colors.map(color => (
            <div key={color.hex} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Color Preview */}
              <div 
                className="h-20 sm:h-28 w-full transition-transform hover:scale-105"
                style={{ backgroundColor: color.hex }}
              />

              {/* Color Info */}
              <div className="p-3 sm:p-4">
                <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-base mb-2">
                  {color.name}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs text-[var(--color-muted)]">Hex:</span>
                  <code className="font-mono text-[10px] sm:text-xs font-bold text-[var(--color-primary)] bg-[var(--color-bg-alt)] px-2 py-1 rounded">
                    {color.hex}
                  </code>
                </div>

                <div className="border-t border-[var(--color-border)] pt-2 sm:pt-3">
                  <span className="text-[9px] sm:text-xs text-[var(--color-muted)] block mb-1">CSS Variable:</span>
                  <code className="text-[10px] sm:text-xs font-bold text-[var(--color-primary-dark)] bg-[var(--color-primary-light)] px-2 sm:px-3 py-1.5 sm:py-2 rounded block break-all">
                    {color.css}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Tips */}
        <div className="mt-8 sm:mt-16 p-4 sm:p-6 bg-[var(--color-primary-light)] rounded-xl sm:rounded-2xl border border-[var(--color-primary)]/20">
          <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-lg mb-3 sm:mb-4">📝 Usage Tips</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--color-text)]">
            <li>✓ Use CSS variables for consistency: <code className="font-mono bg-[var(--color-primary)]/10 px-1">var(--color-primary)</code></li>
            <li>✓ Use Tailwind classes for styling: <code className="font-mono bg-[var(--color-primary)]/10 px-1">bg-[var(--color-primary)]</code></li>
            <li>✓ Always use color pairs (foreground + background)</li>
            <li>✓ Check contrast ratios (WCAG AA: 4.5:1 minimum)</li>
            <li>✓ Test in dark mode with adjusted colors</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-[var(--color-border)] text-center text-[var(--color-muted)] text-xs sm:text-sm">
          <p>This reference component is for development only.</p>
          <p>Remove <code className="font-mono text-[var(--color-primary)]">ColorPaletteReference</code> before production deployment.</p>
        </div>
      </div>
    </div>
  )
}