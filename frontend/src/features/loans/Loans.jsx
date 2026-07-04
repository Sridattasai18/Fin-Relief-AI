import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, Check, CreditCard, ChevronRight } from 'lucide-react'
import client from '../../api/client'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import SectionCard from '../../components/ui/SectionCard'
import LoanDetailsDrawer from '../../components/layout/LoanDetailsDrawer'

/* ── Formatters ─────────────────────────────────────────────── */
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

const LOAN_TYPES = ['Personal loan', 'Credit card', 'Digital lending app', 'NBFC loan', 'Home loan', 'Vehicle loan']

function overdueVariant(days) {
  if (days === 0) return 'healthy'
  if (days <= 30)  return 'tight'
  return 'high'
}
function overdueLabel(days) {
  if (days === 0)  return 'Current'
  if (days <= 30)  return 'Tight'
  return 'Overdue'
}

function computeDTI(loan) {
  return Math.min(100, (loan.emi / Math.max(loan.income, 1)) * 100)
}
function dtiColor(dti) {
  if (dti < 35) return 'var(--color-green)'
  if (dti < 55) return 'var(--color-amber)'
  return 'var(--color-danger)'
}

/* ── Add / Edit shared form ─────────────────────────────────── */
function LoanForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    lender:          initial.lender         || '',
    loan_type:       initial.loan_type      || 'Personal loan',
    amount:          initial.amount         || '',
    emi:             initial.emi            || '',
    overdue_days:    initial.overdue_days   ?? 0,
    income:          initial.income         || '',
    monthly_expenses:initial.monthly_expenses || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.lender.trim())     e.lender = 'Lender name is required.'
    if (!form.amount || form.amount <= 0) e.amount = 'Enter a valid amount.'
    if (!form.emi    || form.emi    <= 0) e.emi    = 'Enter a valid EMI.'
    if (!form.income || form.income <= 0) e.income = 'Monthly income is required.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      lender:           form.lender.trim(),
      loan_type:        form.loan_type,
      amount:           parseFloat(form.amount),
      emi:              parseFloat(form.emi),
      overdue_days:     parseInt(form.overdue_days) || 0,
      income:           parseFloat(form.income),
      monthly_expenses: form.monthly_expenses ? parseFloat(form.monthly_expenses) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Group 1: Lender details */}
      <div>
        <p className="section-label" style={{ fontSize: '0.625rem', marginBottom: 12 }}>1. Account Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input id="f-lender" label="Lender" value={form.lender} onChange={set('lender')} error={errors.lender} placeholder="e.g. HDFC Bank" />
          <div>
            <label htmlFor="f-loan-type" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-ink)', display: 'block', marginBottom: 4 }}>
              Loan type
            </label>
            <select
              id="f-loan-type"
              value={form.loan_type}
              onChange={set('loan_type')}
              className="input-base"
            >
              {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Group 2: Repayment details */}
      <div>
        <p className="section-label" style={{ fontSize: '0.625rem', marginBottom: 12 }}>2. Repayment Status</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="form-three-col">
          <Input id="f-amount" label="Outstanding balance (₹)" type="number" value={form.amount} onChange={set('amount')} error={errors.amount} placeholder="e.g. 150000" />
          <Input id="f-emi" label="Monthly EMI (₹)" type="number" value={form.emi} onChange={set('emi')} error={errors.emi} placeholder="e.g. 6500" />
          <Input id="f-overdue" label="Overdue days" type="number" value={form.overdue_days} onChange={set('overdue_days')} hint="Days since payment due" />
        </div>
      </div>

      {/* Group 3: Income & context */}
      <div>
        <p className="section-label" style={{ fontSize: '0.625rem', marginBottom: 12 }}>3. Financial Context</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input id="f-income" label="Monthly take-home income (₹)" type="number" value={form.income} onChange={set('income')} error={errors.income} placeholder="e.g. 35000" />
          <Input id="f-exp" label="Monthly expenses (₹) — optional" type="number" value={form.monthly_expenses} onChange={set('monthly_expenses')} hint="Defaults to 40% of income if blank" />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          <Check size={14} /> {initial.id ? 'Save changes' : 'Add loan'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          <X size={14} /> Cancel
        </Button>
      </div>
    </form>
  )
}

export default function Loans() {
  const navigate = useNavigate()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Side Drawer details panel
  const [selectedDrawerLoan, setSelectedDrawerLoan] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/loans')
      setLoans(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load loans.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (payload) => {
    setSavingId('new')
    try {
      await client.post('/loans', payload)
      setShowAddForm(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add loan.')
    } finally {
      setSavingId(null)
    }
  }

  const handleEdit = async (id, payload) => {
    setSavingId(id)
    try {
      await client.patch(`/loans/${id}`, payload)
      setEditingId(null)
      setSelectedDrawerLoan(null) // Sync drawer if open
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update loan.')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await client.delete(`/loans/${deleteTarget.id}`)
      setDeleteTarget(null)
      setSelectedDrawerLoan(null) // Sync drawer if open
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete loan.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Spinner size="md" />
        <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading loans…</span>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1240, margin: '0 auto' }} className="fade-in">
      <PageHeader
        sectionNumber="02 / MY LOANS"
        title="My Loans"
        subtitle="Track open credit lines, review payment status, and initiate negotiation letters."
        action={
          <Button
            id="add-loan-btn"
            variant="primary"
            size="md"
            onClick={() => { setShowAddForm(v => !v); setEditingId(null) }}
          >
            <Plus size={15} /> Add loan
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          style={{ padding: '8px 12px', background: 'var(--color-danger-dim)', border: '1px solid #E8B8B8', borderRadius: 4, fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      {/* Search Filter */}
      {loans.length > 0 && !showAddForm && (
        <div style={{ marginBottom: 20, maxWidth: 320 }}>
          <Input
            id="f-search"
            placeholder="Search by lender or loan type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Add loan form */}
      {showAddForm && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            marginBottom: 20,
          }}
          className="fade-in"
        >
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 20, color: 'var(--color-ink)' }}>
            Add a new loan record
          </p>
          <LoanForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            loading={savingId === 'new'}
          />
        </div>
      )}

      {/* Empty state (max-width constrained, compact) */}
      {loans.length === 0 && !showAddForm && (
        <div style={{ maxWidth: 480, margin: '40px auto 0' }}>
          <EmptyState
            title="No loans added yet"
            description="Add your loan details to track repayments, debt stress, and settlement options."
            Icon={CreditCard}
            actionText="Add loan"
            onAction={() => setShowAddForm(true)}
            maxHeight="320px"
          />
        </div>
      )}

      {/* Loans table */}
      {loans.length > 0 && (
        <SectionCard bodyStyle={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  {['Lender / Account', 'Outstanding Balance', 'Monthly EMI', 'Overdue Timeline', 'Status', ''].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 18px',
                        textAlign: 'left',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--color-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans
                  .filter(l => l.lender.toLowerCase().includes(searchQuery.toLowerCase()) || l.loan_type.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((loan) => (
                  <React.Fragment key={loan.id}>
                    <tr
                      key={loan.id}
                      style={{
                        borderBottom: editingId === loan.id ? 'none' : '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      onClick={() => setSelectedDrawerLoan(loan)}
                    >
                      <td style={{ padding: '14px 18px', width: '28%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-ink)' }}>{loan.lender}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{loan.loan_type}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 140 }}>
                            <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${computeDTI(loan)}%`, background: dtiColor(computeDTI(loan)), borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: '0.625rem', color: 'var(--color-muted)' }}>{Math.round(computeDTI(loan))}% DTI</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.875rem', color: 'var(--color-ink)', fontFamily: 'var(--font-heading)' }}>
                        {inr(loan.amount)}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                        {inr(loan.emi)}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        {loan.overdue_days} days
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={overdueVariant(loan.overdue_days)}>
                          {overdueLabel(loan.overdue_days)}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit loan"
                            onClick={() => setEditingId(editingId === loan.id ? null : loan.id)}
                          >
                            <Pencil size={13} strokeWidth={1.75} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete loan"
                            onClick={() => setDeleteTarget(loan)}
                            className="hover:text-[color:var(--color-danger)]"
                          >
                            <Trash2 size={13} strokeWidth={1.75} />
                          </Button>
                          <ChevronRight size={15} color="var(--color-border)" style={{ marginTop: 2 }} />
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingId === loan.id && (
                      <tr key={`edit-${loan.id}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td
                          colSpan={6}
                          style={{ padding: '20px', background: 'var(--color-surface)' }}
                        >
                          <LoanForm
                            initial={loan}
                            onSave={(payload) => handleEdit(loan.id, payload)}
                            onCancel={() => setEditingId(null)}
                            loading={savingId === loan.id}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {loans.filter(l => l.lender.toLowerCase().includes(searchQuery.toLowerCase()) || l.loan_type.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                      No loans match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Drawer Details Panel */}
      <LoanDetailsDrawer
        loan={selectedDrawerLoan}
        isOpen={!!selectedDrawerLoan}
        onClose={() => setSelectedDrawerLoan(null)}
        onEdit={() => { setEditingId(selectedDrawerLoan.id); setSelectedDrawerLoan(null) }}
        onDelete={() => { setDeleteTarget(selectedDrawerLoan); setSelectedDrawerLoan(null) }}
        onAnalyse={() => navigate('/settlement', { state: { loanId: selectedDrawerLoan.id } })}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this loan?"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
          You are about to delete the{' '}
          <strong style={{ color: 'var(--color-ink)' }}>{deleteTarget?.lender}</strong> loan record
          ({deleteTarget?.loan_type}). This will also remove all associated letters and snapshots.
          This action cannot be undone.
        </p>
        <Modal.Footer>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
            Delete loan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
