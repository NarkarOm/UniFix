import { X, Eye, CheckCheck, Zap, Droplets, Hammer, Sparkles, Monitor, Shield, Bath, FileText } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { CATEGORY, STATUS, COMPLAINT_FLOW } from '../constants'
import { formatDate, formatDateShort, cap } from '../utils/dateUtils'
import { StatusBadge, SectionHeader, TabBar } from '../components/SharedComponents'

const CATEGORY_ICONS = {
  electrical: Zap, plumbing: Droplets, carpentry: Hammer,
  cleaning: Sparkles, technician: Monitor, safety: Shield,
  washroom: Bath, others: FileText,
}

export function ComplaintsSection({ allComplaints, visible, activeTab, onTabChange, cs, loading, focused, setFocused }) {
  const { tokens } = useTheme()
  const flaggedCount = allComplaints.filter(c => c.flagged && !c.flagResolved && ['pending', 'assigned', 'in_progress'].includes(c.status)).length

  const tabs = [
    { key: 'all', label: 'All', count: cs.total ?? allComplaints.length },
    { key: 'flagged', label: 'Flagged', count: flaggedCount },
    { key: 'pending', label: 'Pending', count: cs.pending },
    { key: 'assigned', label: 'Assigned', count: cs.assigned },
    { key: 'in_progress', label: 'In Progress', count: cs.in_progress },
    { key: 'completed', label: 'Completed', count: cs.completed },
    { key: 'rejected', label: 'Rejected', count: cs.rejected },
  ]

  return (
    <div>
      <SectionHeader title="Complaint Management" subtitle="Full complaint history and real-time status tracking" />
      <div style={{
        background: tokens.surface, borderRadius: tokens.radius.xxl,
        border: `1px solid ${tokens.border}`, overflow: 'hidden', boxShadow: tokens.shadow,
      }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${tokens.border}` }}>
          <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: tokens.tableHeadBg }}>
                {['', 'Complaint', 'Category', 'Location', 'Reported By', 'Status', 'Date', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em',
                    textTransform: 'uppercase', borderBottom: `1px solid ${tokens.border}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No complaints found</td></tr>
              ) : visible.map(c => {
                const catMeta = CATEGORY[c.category] ?? CATEGORY.others
                const CatIcon = CATEGORY_ICONS[c.category] ?? CATEGORY_ICONS.others
                const isFlagged = c.flagged && !c.flagResolved && ['pending', 'assigned', 'in_progress'].includes(c.status)
                return (
                  <tr key={c.id}
                    style={{
                      transition: 'background 0.1s', cursor: 'pointer',
                      background: isFlagged ? tokens.dangerBg : 'transparent',
                      borderLeft: isFlagged ? `3px solid ${tokens.danger}` : '3px solid transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isFlagged ? tokens.dangerBg : tokens.tableRowHover}
                    onMouseLeave={e => e.currentTarget.style.background = isFlagged ? tokens.dangerBg : 'transparent'}
                  >
                    <td style={{ padding: '10px 8px 10px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: tokens.radius.lg,
                        background: tokens.surfaceHigh, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {c.photoUrl
                          ? <img src={c.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <CatIcon size={15} color={catMeta.color} />
                        }
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>{c.subIssue || c.customIssue || 'Issue Reported'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: 'monospace' }}>{c.ticketId}</div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, fontSize: 12, fontWeight: 700, color: catMeta.color }}>
                      {cap(c.category)}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{ fontSize: 12, color: tokens.textSecondary }}>{c.building || '—'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{c.roomDetail}</div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textSecondary }}>{c.submittedByName || '—'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{cap(c.submittedByRole)}</div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <StatusBadge status={c.status} />
                      {isFlagged && (
                        <div style={{ marginTop: 4 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 10, fontWeight: 700, padding: '2px 7px',
                            borderRadius: tokens.radius.pill,
                            background: tokens.dangerBg, color: tokens.danger,
                            border: `1px solid ${tokens.dangerBorder}`,
                          }}>FLAGGED</span>
                        </div>
                      )}
                      {c.hodEmailSent && (
                        <div style={{ marginTop: 4 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: 10, fontWeight: 700, padding: '2px 7px',
                            borderRadius: tokens.radius.pill,
                            background: tokens.warningBg, color: tokens.warning,
                            border: `1px solid ${tokens.warningBorder}`,
                          }}>HOD</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, fontSize: 11, color: tokens.textMuted }}>{formatDateShort(c.createdAt)}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.border}` }}>
                      <button
                        onClick={() => setFocused(c)}
                        style={{
                          background: tokens.success, color: '#fff',
                          padding: '5px 12px', borderRadius: tokens.radius.md,
                          border: 'none', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'inherit',
                        }}
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{
          padding: '10px 18px', borderTop: `1px solid ${tokens.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: tokens.textMuted }}>Showing {visible.length} of {allComplaints.length} entries</span>
        </div>
      </div>
      {focused && <ComplaintModal complaint={focused} onClose={() => setFocused(null)} />}
    </div>
  )
}

export function ComplaintModal({ complaint, onClose }) {
  const { tokens } = useTheme()
  const catMeta = CATEGORY[complaint.category] ?? CATEGORY.others
  const CatIcon = CATEGORY_ICONS[complaint.category] ?? CATEGORY_ICONS.others
  const stepIndex = COMPLAINT_FLOW.indexOf(complaint.status)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: tokens.modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20, backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tokens.surface, borderRadius: tokens.radius.xxl,
          width: '100%', maxWidth: 720, maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: tokens.radius.lg,
              background: catMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CatIcon size={20} color={catMeta.color} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>{complaint.subIssue || complaint.customIssue || 'Issue Reported'}</div>
              <div style={{ fontSize: 11, color: tokens.textMuted, fontFamily: 'monospace', marginTop: 2 }}>{complaint.ticketId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusBadge status={complaint.status} />
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: tokens.radius.md,
                background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: tokens.textSecondary,
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {complaint.status !== 'rejected' && (
            <div style={{ background: tokens.surfaceLow, borderRadius: tokens.radius.xl, padding: 18, border: `1px solid ${tokens.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>Progress</div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {COMPLAINT_FLOW.map((step, i) => {
                  const done = i <= stepIndex
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', zIndex: 1, marginBottom: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? tokens.primary : tokens.surfaceHigh,
                        border: `2px solid ${done ? tokens.primary : tokens.border}`,
                        transition: 'all 0.2s',
                      }}>
                        {done && <CheckCheck size={11} color="#fff" strokeWidth={3} />}
                      </div>
                      {i < COMPLAINT_FLOW.length - 1 && (
                        <div style={{
                          position: 'absolute', top: 13, left: '50%', width: '100%', height: 2, zIndex: 0,
                          background: i < stepIndex ? tokens.primary : tokens.border,
                          transition: 'background 0.2s',
                        }} />
                      )}
                      <div style={{ fontSize: 10, textAlign: 'center', fontWeight: done ? 700 : 500, color: done ? tokens.text : tokens.textMuted }}>
                        {STATUS[step]?.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              {
                title: 'Complaint Details',
                rows: [
                  ['Category', cap(complaint.category)],
                  ['Issue', complaint.subIssue || complaint.customIssue],
                  ...(complaint.description ? [['Description', complaint.description]] : []),
                  ['Building', complaint.building],
                  ['Room / Area', complaint.roomDetail],
                  ['Submitted', formatDate(complaint.createdAt)],
                ],
              },
              {
                title: 'Reported By',
                rows: [
                  ['Name', complaint.submittedByName],
                  ['Email', complaint.submittedByEmail],
                  ['Phone', complaint.submittedByPhone || '—'],
                  ['Role', cap(complaint.submittedByRole)],
                ],
              },
              {
                title: 'Assignment',
                rows: [['Assigned To', complaint.assignedToName || 'Not yet assigned']],
              },
            ].map(panel => (
              <div key={panel.title} style={{ background: tokens.surfaceLow, borderRadius: tokens.radius.xl, padding: 15, border: `1px solid ${tokens.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{panel.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {panel.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500, flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 12, color: tokens.textSecondary, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all', minWidth: 0 }}>{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {complaint.photoUrl && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Attached Photo</div>
              <img
                src={complaint.photoUrl} alt="complaint"
                onClick={() => window.open(complaint.photoUrl, '_blank')}
                style={{
                  width: '100%', maxHeight: 280, objectFit: 'cover',
                  borderRadius: tokens.radius.xl, cursor: 'pointer',
                  border: `1px solid ${tokens.border}`, display: 'block',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}