import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AnimatedButton({
  children,
  variant = 'primary', // primary, secondary, outline, danger, success
  size = 'md', // sm, md, lg
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

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all-smooth hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  const variantClasses = {
    primary: 'bg-gradient-pastel-2 text-primary-foreground hover:shadow-lg',
    secondary: 'bg-gradient-pastel-3 text-secondary-foreground hover:shadow-lg',
    outline: 'border-2 border-border text-foreground hover:border-primary hover:bg-gradient-soft-lavender',
    danger: 'bg-destructive text-destructive-foreground hover:shadow-lg',
    success: 'bg-accent text-accent-foreground hover:shadow-lg',
    ghost: 'text-primary hover:bg-gradient-soft-lavender',
  }

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
        <Loader2 size={18} className="animate-spin" />
      )}

      {Icon && !loading && iconPosition === 'left' && (
        <Icon size={18} />
      )}

      <span>{children}</span>

      {Icon && !loading && iconPosition === 'right' && (
        <Icon size={18} />
      )}

      {loading && iconPosition === 'right' && (
        <Loader2 size={18} className="animate-spin" />
      )}
    </button>
  )
}
