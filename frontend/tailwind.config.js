/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent:    'var(--color-accent)',
        icon:      'var(--color-icon)',
        btn:       'var(--color-btn)',
        'btn-hover':'var(--color-btn-hover)',
        surface:   'var(--color-surface)',
        border:    'var(--color-border)',
        text:      'var(--color-text)',
        muted:     'var(--color-muted)',
      },
    },
  },
  plugins: [],
}