export default function SectionCard({
  title,
  action,
  children,
  className = '',
  style = {},
  bodyStyle = {},
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {(title || action) && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface)',
          }}
        >
          {title && <p className="section-label">{title}</p>}
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: '20px', ...bodyStyle }}>{children}</div>
    </div>
  )
}
