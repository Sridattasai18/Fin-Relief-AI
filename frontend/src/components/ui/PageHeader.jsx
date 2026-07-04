export default function PageHeader({ sectionNumber, title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div>
        {sectionNumber && (
          <p className="section-label" style={{ marginBottom: 6 }}>
            {sectionNumber}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
