import Badge from './Badge'

export default function MetricCard({
  label,
  value,
  foot,
  Icon,
  badgeVariant,
  badgeLabel,
  accent = false,
  progress = null, // numeric 0-100 for a progress bar
  progressColor = 'var(--color-amber)',
}) {
  // When both progress and badgeLabel are provided, show bar + label beneath it.
  // When only one is provided, the existing behaviour is preserved.
  const showProgressAndBadge = progress !== null && badgeLabel

  return (
    <div
      style={{
        background: accent ? 'var(--color-ink)' : 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
      }}
    >
      {/* Header row — label + icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className="section-label"
          style={{ color: accent ? 'rgba(255,255,255,0.5)' : 'var(--color-muted)' }}
        >
          {label}
        </span>
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            style={{ color: accent ? 'rgba(255,255,255,0.4)' : 'var(--color-border)' }}
          />
        )}
      </div>

      {/* Primary value */}
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 400,
          color: accent ? 'white' : 'var(--color-ink)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>

      {/* Progress bar — always shown when progress prop is provided */}
      {progress !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              width: '100%',
              height: 4,
              background: accent ? 'rgba(255,255,255,0.1)' : 'var(--color-surface)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: progressColor,
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          {/* Badge label beneath the bar when both are present */}
          {showProgressAndBadge && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Badge variant={badgeVariant}>{badgeLabel}</Badge>
            </div>
          )}
        </div>
      )}

      {/* Footer row — badge (if no progress bar) + foot text */}
      {((!showProgressAndBadge && badgeLabel) || foot) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            color: accent ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)',
            flexWrap: 'wrap',
          }}
        >
          {!showProgressAndBadge && badgeLabel && (
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          )}
          {foot && <span>{foot}</span>}
        </div>
      )}
    </div>
  )
}
