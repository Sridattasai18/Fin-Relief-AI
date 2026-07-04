/**
 * Input — standardized text/email/password input
 * Includes label, helper text, and error state
 */
export default function Input({
  id,
  label,
  error,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: error ? 'var(--color-danger)' : 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-base ${error ? 'error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
        >
          {error}
        </span>
      )}
      {!error && hint && (
        <span
          id={`${id}-hint`}
          style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
