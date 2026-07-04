import Button from './Button'

export default function EmptyState({
  title,
  description,
  Icon,
  actionText,
  onAction,
  maxHeight = '420px',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        textAlign: 'center',
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        maxWidth: 480,
        margin: '24px auto',
        minHeight: maxHeight,
      }}
      className="fade-in"
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Icon size={20} strokeWidth={1.5} color="var(--color-muted)" />
        </div>
      )}
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 400,
          color: 'var(--color-ink)',
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-muted)',
          lineHeight: 1.65,
          marginBottom: 24,
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  )
}
