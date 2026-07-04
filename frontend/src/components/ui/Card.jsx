/**
 * Card variants — shadow and radius vary intentionally by context:
 *   flat    — very subtle, for nested content or sidebars (1px border only)
 *   default — standard dashboard card
 *   raised  — for primary focus areas, modals, metric highlights
 *   paper   — spacious, for letter/document views
 */
const variants = {
  flat: {
    border:  '1px solid var(--color-border)',
    background: 'white',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'none',
  },
  default: {
    border:  '1px solid var(--color-border)',
    background: 'white',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
  },
  raised: {
    border:  '1px solid var(--color-border)',
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-raised)',
  },
  paper: {
    border:  '1px solid var(--color-border)',
    background: 'white',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-raised)',
    padding: '2rem 2.25rem',
  },
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      style={{ ...variants[variant] || variants.default, ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
