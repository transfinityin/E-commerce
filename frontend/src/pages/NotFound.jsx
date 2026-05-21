import { Link } from 'react-router-dom'
import { Home, Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16">

      {/* 404 Visual */}
      <div className="relative mb-6 sm:mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce-subtle">
          <Compass size={36} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-[var(--color-primary)] leading-none">
          404
        </h1>
      </div>

      {/* Text Content */}
      <div className="max-w-sm sm:max-w-md mx-auto">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)] mb-2 sm:mb-3">
          Lost in Space
        </p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-2 sm:mb-3">
          Page Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
          The page you are looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 px-5 sm:px-6 py-3 sm:py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Home size={14} className="sm:w-4 sm:h-4" />
            Go Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 px-5 sm:px-6 py-3 sm:py-3.5 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            Browse Products
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="mt-12 sm:mt-16 flex items-center gap-2 text-[10px] sm:text-xs text-[var(--color-muted-light)]">
        <span className="w-6 sm:w-8 h-px bg-[var(--color-border-light)]" />
        <span>TransFinity</span>
        <span className="w-6 sm:w-8 h-px bg-[var(--color-border-light)]" />
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}