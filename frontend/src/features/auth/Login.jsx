import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

function AuthSidebar() {
  return (
    <div
      style={{
        background: 'var(--color-ink)',
        color: 'white',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100%',
      }}
    >
      {/* Brand */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 48 }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            FinRelief
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--color-amber)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            AI
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.25rem',
            fontWeight: 300,
            lineHeight: 1.2,
            color: 'white',
            marginBottom: 20,
          }}
        >
          Understand your debt.{' '}
          <em style={{ fontStyle: 'italic', color: '#C8B99A' }}>
            Take control.
          </em>
        </h2>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65,
            maxWidth: 280,
          }}
        >
          AI-powered settlement analysis, negotiation letter generation, and a clear path
          out of debt — in one place.
        </p>
      </div>

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          'Debt stress scoring & DTI analysis',
          'AI-generated negotiation letters',
          'What-if settlement simulations',
          'Lender-by-lender breakdown',
        ].map((text) => (
          <div
            key={text}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-amber)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginTop: 32 }}>
        For educational and informational purposes only.
      </p>
    </div>
  )
}

export default function Login() {
  const { login, tryDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setError('')
    setDemoLoading(true)
    try {
      await tryDemo()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not start demo session. Please try again.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--color-cream)',
      }}
      className="auth-layout"
    >
      {/* Left: editorial sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <AuthSidebar />
      </div>

      {/* Right: login form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: 'var(--color-cream)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }} className="fade-in">
          {/* Mobile brand (visible only on small screens) */}
          <div className="flex md:hidden items-baseline gap-2 mb-8">
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: 32 }}>
            Sign in to your account to continue.
          </p>

          {/* Try Demo button — prominent, above the form */}
          <button
            id="try-demo-btn"
            type="button"
            onClick={handleDemo}
            disabled={demoLoading || loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              marginBottom: 24,
              background: 'var(--color-amber-dim)',
              border: '1px solid #E8C9A4',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: demoLoading || loading ? 'not-allowed' : 'pointer',
              opacity: demoLoading || loading ? 0.6 : 1,
              transition: 'background 0.15s ease, border-color 0.15s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { if (!demoLoading && !loading) e.currentTarget.style.background = '#EDD8B8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-amber-dim)' }}
          >
            <Sparkles size={15} color="var(--color-amber)" strokeWidth={1.75} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-amber)' }}>
              {demoLoading ? 'Starting demo…' : 'Try a live demo — no account needed'}
            </span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>or sign in</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base"
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
            </div>

            {error && (
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
                {error}
              </div>
            )}

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={demoLoading}
              style={{ width: '100%', marginTop: 4 }}
            >
              {!loading && <ArrowRight size={16} strokeWidth={2} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p style={{ marginTop: 24, fontSize: '0.8125rem', color: 'var(--color-muted)', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--color-amber)', fontWeight: 500, textDecoration: 'none' }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
