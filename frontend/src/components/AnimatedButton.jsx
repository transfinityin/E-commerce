import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  const [isHovering, setIsHovering] = useState(false)

  const baseClasses = 'inline-flex items-center justify-center gap-1.5 sm:gap-2 font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'px-3 py-2 text-[10px] sm:text-xs h-8 sm:h-9',
    md: 'px-4 py-2.5 sm:py-3 text-xs sm:text-sm h-10 sm:h-11',
    lg: 'px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base h-11 sm:h-12',
  }

  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] hover:shadow-md',
    secondary: 'bg-[var(--color-secondary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-secondary-light)] hover:shadow-md',
    outline: 'border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 hover:shadow-md',
    success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 hover:shadow-md',
    ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
  }

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && iconPosition === 'left' && (
        <Loader2 size={iconSize} className="animate-spin" />
      )}

      {Icon && !loading && iconPosition === 'left' && (
        <Icon size={iconSize} />
      )}

      <span>{children}</span>

      {Icon && !loading && iconPosition === 'right' && (
        <Icon size={iconSize} />
      )}

      {loading && iconPosition === 'right' && (
        <Loader2 size={iconSize} className="animate-spin" />
      )}
    </button>
  )
}