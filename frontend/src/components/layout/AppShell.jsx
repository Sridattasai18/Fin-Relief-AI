import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

/**
 * MobileHeader — slim top bar visible only on mobile (<768px).
 * Contains wordmark on left and logout icon on right.
 * Uses same logout handler and LogOut icon as the desktop Sidebar.
 * Height: 48px. Does not compete with PageHeader content below.
 */
function MobileHeader() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        height: 48,
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}
    >
      {/* Wordmark — matches Sidebar brand block styling */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 400,
            color: 'var(--color-ink)',
            letterSpacing: '-0.02em',
          }}
        >
          FinRelief
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--color-amber)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          AI
        </span>
      </div>

      {/* Logout — 44×44px touch target, same LogOut icon as desktop sidebar */}
      <Button
        variant="ghost"
        onClick={handleLogout}
        title="Log out"
        aria-label="Log out"
        style={{
          /* 44×44 touch target */
          width: 44,
          height: 44,
          padding: 0,
          /* pull right edge flush with page padding */
          marginRight: -8,
          flexShrink: 0,
        }}
        onTouchStart={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
        onTouchEnd={(e) => (e.currentTarget.style.background = 'none')}
      >
        <LogOut size={18} strokeWidth={1.75} />
      </Button>
    </header>
  )
}

/**
 * AppShell — responsive layout wrapper for authenticated pages.
 * Desktop (≥768px): sticky Sidebar on left + scrollable main content.
 * Mobile (<768px):  sticky MobileHeader at top + scrollable content + fixed BottomNav.
 *
 * Mobile safe-area accounting:
 *   - MobileHeader: 48px
 *   - BottomNav: 60px + env(safe-area-inset-bottom)
 *   - paddingBottom on mobile container reserves space so content isn't hidden under BottomNav
 */
export default function AppShell({ children }) {
  return (
    <>
      {/* Desktop layout — hidden on mobile */}
      <div
        className="hidden md:flex"
        style={{ minHeight: '100vh', background: 'var(--color-cream)' }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            background: 'var(--color-cream)',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile layout — hidden on desktop */}
      <div
        className="flex flex-col md:hidden"
        style={{
          minHeight: '100vh',
          background: 'var(--color-cream)',
        }}
      >
        <MobileHeader />
        <main
          style={{
            flex: 1,
            /* 60px BottomNav + safe-area — matches BottomNav height */
            paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  )
}
