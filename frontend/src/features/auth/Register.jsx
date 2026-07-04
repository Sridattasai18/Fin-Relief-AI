import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!name.trim())           e.name     = 'Full name is required.'
    if (!email.trim())          e.email    = 'Email address is required.'
    if (password.length < 8)   e.password = 'Password must be at least 8 characters.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--color-cream)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 400 }}>
            FinRelief
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-amber)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 400,
            color: 'var(--color-ink)',
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}
        >
          Create your account
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 32 }}>
          Free to use. No credit card required.
        </p>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            id="reg-name"
            label="Full name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })) }}
            placeholder="Rahul Sharma"
            error={errors.name}
            required
          />

          <Input
            id="reg-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })) }}
            placeholder="rahul@example.com"
            error={errors.email}
            required
          />

          {/* Password with show/hide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label
              htmlFor="reg-password"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: errors.password ? 'var(--color-danger)' : 'var(--color-ink)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((prev) => ({ ...prev, password: '' }))
                }}
                placeholder="Min. 8 characters"
                required
                className={`input-base ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Password strength hint */}
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 2,
                    background:
                      password.length >= 12 && i < 4 ? 'var(--color-green)'
                      : password.length >= 8 && i < 3 ? 'var(--color-amber)'
                      : password.length >= 6 && i < 2 ? '#D8A06B'
                      : i === 0 ? 'var(--color-danger)'
                      : 'var(--color-border)',
                    transition: 'background 0.2s ease',
                  }}
                />
              ))}
            </div>
          )}

          {apiError && (
            <div
              role="alert"
              style={{
                padding: '8px 12px',
                background: 'var(--color-danger-dim)',
                border: '1px solid #E8B8B8',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                color: 'var(--color-danger)',
              }}
            >
              {apiError}
            </div>
          )}

          <Button
            id="register-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: 4 }}
          >
            {!loading && <ArrowRight size={16} strokeWidth={2} />}
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p style={{ marginTop: 24, fontSize: '0.8125rem', color: 'var(--color-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-amber)', fontWeight: 500, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </p>

        <p style={{ marginTop: 16, fontSize: '0.6875rem', color: 'var(--color-border)', textAlign: 'center', lineHeight: 1.5 }}>
          By creating an account you agree to use this platform for educational purposes only.
        </p>
      </div>
    </div>
  )
}
