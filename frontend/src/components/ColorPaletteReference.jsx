/**
 * Color Palette Reference Component
 * Use this to verify colors are rendering correctly
 * Remove from production
 */

export default function ColorPaletteReference() {
  const colors = [
    { name: 'Primary (Lavender)', hex: '#d4b9e8', css: 'bg-primary' },
    { name: 'Primary Foreground', hex: '#2d1b3d', css: 'bg-primary-foreground' },
    
    { name: 'Secondary (Peach)', hex: '#ffd6cc', css: 'bg-secondary' },
    { name: 'Secondary Foreground', hex: '#4a2415', css: 'bg-secondary-foreground' },
    
    { name: 'Accent (Mint)', hex: '#b8e8d9', css: 'bg-accent' },
    { name: 'Accent Foreground', hex: '#1d3a2e', css: 'bg-accent-foreground' },
    
    { name: 'Background', hex: '#faf8fc', css: 'bg-background' },
    { name: 'Foreground', hex: '#2d2d2d', css: 'bg-foreground' },
    
    { name: 'Card', hex: '#ffffff', css: 'bg-card' },
    { name: 'Card Foreground', hex: '#2d2d2d', css: 'bg-card-foreground' },
    
    { name: 'Muted', hex: '#f0e8f8', css: 'bg-muted' },
    { name: 'Muted Foreground', hex: '#666666', css: 'bg-muted-foreground' },
    
    { name: 'Border', hex: '#e8dff5', css: 'bg-border' },
    { name: 'Destructive', hex: '#ff9999', css: 'bg-destructive' },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Color Palette Reference
        </h1>
        <p className="text-muted-foreground mb-12">
          Visual reference for all design system colors. Remove this component in production.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {colors.map(color => (
            <div key={color.hex} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Color Preview */}
              <div 
                className="h-32 w-full transition-transform hover:scale-105"
                style={{ backgroundColor: color.hex }}
              />

              {/* Color Info */}
              <div className="p-4">
                <h3 className="font-bold text-foreground text-lg mb-2">
                  {color.name}
                </h3>

                {/* Hex Code */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Hex:</span>
                  <code className="font-mono text-sm font-bold text-primary bg-muted px-2 py-1 rounded">
                    {color.hex}
                  </code>
                </div>

                {/* CSS Variable */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">CSS:</span>
                  <code className="font-mono text-sm font-bold text-primary bg-muted px-2 py-1 rounded">
                    var({color.css.replace('bg-', '--')})
                  </code>
                </div>

                {/* Tailwind Class */}
                <div className="border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground block mb-1">Tailwind Class:</span>
                  <code className="text-sm font-bold text-accent-foreground bg-accent/20 px-3 py-2 rounded block break-all">
                    {color.css}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradients Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Gradient Backgrounds</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Pastel 1 (Lavender → Mint)', class: 'bg-gradient-pastel-1' },
              { name: 'Pastel 2 (Primary)', class: 'bg-gradient-pastel-2' },
              { name: 'Pastel 3 (Peach → Blue)', class: 'bg-gradient-pastel-3' },
              { name: 'Soft Lavender', class: 'bg-gradient-soft-lavender' },
              { name: 'Soft Peach', class: 'bg-gradient-soft-peach' },
              { name: 'Soft Mint', class: 'bg-gradient-soft-mint' },
            ].map(gradient => (
              <div key={gradient.class} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className={`${gradient.class} h-32 w-full`} />
                <div className="p-4">
                  <p className="font-bold text-foreground">{gradient.name}</p>
                  <code className="text-xs font-mono text-accent-foreground bg-accent/20 px-2 py-1 rounded block mt-2 break-all">
                    {gradient.class}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-16 p-6 bg-gradient-soft-lavender rounded-2xl border border-primary">
          <h3 className="font-bold text-foreground text-lg mb-4">📝 Usage Tips</h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li>✓ Use CSS variables for consistency: <code className="font-mono bg-primary/20 px-1">var(--primary)</code></li>
            <li>✓ Use Tailwind classes for styling: <code className="font-mono bg-primary/20 px-1">bg-primary</code></li>
            <li>✓ Always use color pairs (foreground + background)</li>
            <li>✓ Check contrast ratios (WCAG AA: 4.5:1 minimum)</li>
            <li>✓ Test in dark mode with adjusted colors</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>This reference component is for development only.</p>
          <p>Remove <code className="font-mono">ColorPaletteReference</code> before production deployment.</p>
        </div>
      </div>
    </div>
  )
}
