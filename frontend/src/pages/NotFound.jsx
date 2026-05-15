import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-center" 
      style={{ padding: '0 16px', background: 'var(--color-bg)' }}
    >
      <h1 
        className="text-8xl font-bold" 
        style={{ color: 'var(--color-primary)' }}
      >
        404
      </h1>
      <h2 
        className="text-2xl font-bold" 
        style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--color-text)' }}
      >
        Page Not Found
      </h2>
      <p 
        className="mb-8" 
        style={{ color: 'var(--color-muted)', marginBottom: '32px' }}
      >
        The page you are looking for doesn't exist.
      </p>
      <Link 
        to="/" 
        className="text-white rounded-lg transition-all"
        style={{ 
          padding: '12px 24px',
          background: 'var(--color-primary)',
          display: 'inline-block'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
      >
        Go Home
      </Link>
    </div>
  )
}