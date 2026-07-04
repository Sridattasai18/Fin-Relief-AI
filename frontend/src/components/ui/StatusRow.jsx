/**
 * StatusRow — label + optional description + status pill, right-aligned.
 *
 * Props:
 *   label           string   — primary row label (Inter medium)
 *   description     string?  — secondary line below label (muted, small)
 *   status          string   — pill text, e.g. "Enabled", "Off", "Gemini", "Pending"
 *   statusVariant   "active" | "inactive" | "default"
 *                   active   → amber text + amber-dim background
 *                   inactive → muted text + surface background
 *                   default  → outlined only (border, no fill) — for neutral/info states
 *   divider         bool?    — renders a bottom border (default true, set false for last row)
 *   className       string?
 */

const pillStyles = {
  active: {
    background: 'var(--color-amber-dim)',
    color: 'var(--color-amber)',
    border: '1px solid #E8C9A4',
  },
  inactive: {
    background: 'var(--color-surface)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
  },
  default: {
    background: 'transparent',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-border)',
  },
}

export default function StatusRow({
  label,
  description,
  status,
  statusVariant = 'default',
  divider = true,
  className = '',
}) {
  const pill = pillStyles[statusVariant] || pillStyles.default

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 0',
        borderBottom: divider ? '1px solid var(--color-border)' : 'none',
      }}
      className={className}
    >
      {/* Left: label + description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '0.9rem',
            color: 'var(--color-ink)',
          }}
        >
          {label}
        </span>
        {description && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
              lineHeight: 1.4,
            }}
          >
            {description}
          </span>
        )}
      </div>

      {/* Right: status pill */}
      {status && (
        <span
          style={{
            ...pill,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          {status}
        </span>
      )}
    </div>
  )
}
