import { Loader2 } from 'lucide-react'

/**
 * Button variants:
 *   primary   — filled amber, main CTA
 *   secondary — filled dark ink, secondary actions
 *   outline   — bordered, lighter actions
 *   ghost     — no border/bg, text-only actions
 *   danger    — danger-dim tint at rest, fills solid red on hover (calm at rest, clear on interaction)
 */
const variants = {
  primary:   'bg-amber text-white hover:bg-[color:var(--color-amber-hover)] active:bg-[color:var(--color-amber-active)] border border-amber',
  secondary: 'bg-ink text-cream hover:bg-[color:var(--color-green-hover)] border border-ink',
  outline:   'bg-transparent text-ink border border-[color:var(--color-border)] hover:border-[color:var(--color-muted)] hover:bg-surface',
  ghost:     'bg-transparent text-muted hover:text-ink hover:bg-surface border border-transparent',
  danger:    'bg-danger-dim text-[color:var(--color-danger-hover)] border border-[color:var(--color-danger-hover)] hover:bg-danger hover:text-white active:bg-[color:var(--color-danger-hover)] active:text-white',
}

const sizes = {
  sm:  'h-7 px-4 text-xs gap-1.5',   /* px-4 (16px) gives proper horizontal breathing room vs h-7 (28px) height */
  md:  'h-9 px-5 text-sm gap-2',     /* px-5 (20px) vs h-9 (36px) — better horizontal:vertical ratio */
  lg:  'h-11 px-6 text-sm gap-2',    /* px-6 (24px) vs h-11 (44px) — already well proportioned */
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded',
        'transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-focus-ring)]',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      style={{ fontFamily: 'var(--font-body)' }}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin shrink-0" />}
      {children}
    </button>
  )
}
