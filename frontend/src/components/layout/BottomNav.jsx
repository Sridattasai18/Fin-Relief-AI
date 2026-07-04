import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  Calculator,
  FileText,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/loans',      label: 'Loans',      Icon: CreditCard },
  { to: '/settlement', label: 'Settlement',  Icon: Calculator },
  { to: '/letters',    label: 'Letters',     Icon: FileText },
]

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'white',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 50,
        // safe area for iOS home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            textDecoration: 'none',
            color: isActive ? 'var(--color-amber)' : 'var(--color-muted)',
            borderTop: isActive ? '2px solid var(--color-amber)' : '2px solid transparent',
            transition: 'color 0.12s ease',
            fontFamily: 'var(--font-body)',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ fontSize: '0.625rem', fontWeight: isActive ? 600 : 400 }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
