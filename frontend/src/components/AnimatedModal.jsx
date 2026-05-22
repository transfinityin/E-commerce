import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  className = '',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && closable) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closable, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-[92%] sm:max-w-sm',
    md: 'w-[92%] sm:max-w-md',
    lg: 'w-[92%] sm:max-w-lg',
    xl: 'w-[92%] sm:max-w-xl',
    full: 'w-[96%] sm:w-[92%] md:max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal - Mobile: bottom sheet, Desktop: centered */}
      <div
        ref={modalRef}
        className={`relative bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl border border-[var(--color-border)] shadow-xl animate-slideUp sm:animate-fadeIn ${sizeClasses[size]} ${className} max-h-[85vh] sm:max-h-[90vh] overflow-y-auto`}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
            <h2 className="text-sm sm:text-lg font-bold text-[var(--color-text)]">{title}</h2>
            {closable && (
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-[var(--color-bg-alt)] rounded-lg transition-colors cursor-pointer border-none"
              >
                <X size={18} className="sm:w-5 sm:h-5 text-[var(--color-muted)]" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}