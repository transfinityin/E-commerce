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
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all-smooth text-left ${
          isOpen
            ? 'border-primary bg-gradient-soft-lavender'
            : 'border-border hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {Icon && <Icon size={20} className="text-primary flex-shrink-0" />}
        
        <span className={`flex-1 ${selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={20}
          className={`text-primary flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-border rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  value === option.value
                    ? 'bg-gradient-soft-lavender text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                } ${index !== options.length - 1 ? 'border-b border-border' : ''}`}
                style={{
                  animation: `slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                  animationDelay: `${index * 25}ms`,
                }}
              >
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <option.icon size={18} className="text-primary" />
                  )}
                  <span>{option.label}</span>
                </div>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
