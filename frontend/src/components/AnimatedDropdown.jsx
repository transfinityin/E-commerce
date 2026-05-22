import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function AnimatedDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  disabled = false,
  icon: Icon = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-1.5 sm:mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] ${
          isOpen
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {Icon && <Icon size={16} className="sm:w-5 sm:h-5 text-[var(--color-primary)] flex-shrink-0" />}

        <span className={`flex-1 text-xs sm:text-sm truncate ${selectedOption ? 'text-[var(--color-text)] font-medium' : 'text-[var(--color-muted)]'}`}>
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`sm:w-5 sm:h-5 text-[var(--color-primary)] flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
          <div className="max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide">
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 transition-colors text-xs sm:text-sm ${
                  value === option.value
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-medium'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]'
                } ${index !== options.length - 1 ? 'border-b border-[var(--color-border)]' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <option.icon size={14} className="sm:w-4 sm:h-4 text-[var(--color-primary)]" />
                  )}
                  <span>{option.label}</span>
                </div>
                {option.description && (
                  <p className="text-[10px] sm:text-xs text-[var(--color-muted)] mt-1">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}