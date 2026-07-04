import { useEffect, useRef } from 'react'
import { X, Calendar, Calculator, Edit3, Trash2 } from 'lucide-react'
import Button from '../ui/Button'

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

export default function LoanDetailsDrawer({
  loan,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAnalyse,
}) {
  const drawerRef = useRef(null)

  // Escape key support
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !loan) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,26,23,0.3)',
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.15s ease forwards',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          height: '100%',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.2s ease forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-ink)' }}>
              {loan.lender}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{loan.loan_type}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: 4,
              borderRadius: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Main figures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <span className="section-label" style={{ fontSize: '0.625rem' }}>Outstanding Balance</span>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-ink)', marginTop: 4 }}>
                {inr(loan.amount)}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span className="section-label" style={{ fontSize: '0.625rem' }}>Monthly EMI</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--color-ink)', marginTop: 2 }}>
                  {inr(loan.emi)}
                </p>
              </div>
              <div style={{ background: 'white', border: '1px solid var(--color-border)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span className="section-label" style={{ fontSize: '0.625rem' }}>Overdue Days</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', color: 'var(--color-ink)', marginTop: 2 }}>
                  {loan.overdue_days} days
                </p>
              </div>
            </div>
          </div>

          {/* User Financials context */}
          <div style={{ marginBottom: 28 }}>
            <h4 className="section-label" style={{ marginBottom: 12 }}>Income context</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Assigned Income</span>
                <span style={{ fontWeight: 500 }}>{inr(loan.income)} /mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Assigned Expenses</span>
                <span style={{ fontWeight: 500 }}>
                  {loan.monthly_expenses ? `${inr(loan.monthly_expenses)} /mo` : 'Default (40%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Placeholder */}
          <div style={{ marginBottom: 24 }}>
            <h4 className="section-label" style={{ marginBottom: 12 }}>Timeline</h4>
            <div
              style={{
                display: 'flex',
                gap: 12,
                background: 'var(--color-cream)',
                border: '1px solid var(--color-border)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                alignItems: 'flex-start',
              }}
            >
              <Calendar size={16} color="var(--color-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-ink)' }}>
                  No repayment timeline available yet
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4, lineHeight: 1.45 }}>
                  Repayments are monitored dynamically based on outstanding overdue days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            display: 'flex',
            gap: 8,
          }}
        >
          <Button variant="primary" style={{ flex: 1 }} onClick={onAnalyse}>
            <Calculator size={14} /> Analyse settlement
          </Button>
          <Button variant="outline" title="Edit loan" onClick={onEdit}>
            <Edit3 size={14} />
          </Button>
          <Button variant="danger" title="Delete loan" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
