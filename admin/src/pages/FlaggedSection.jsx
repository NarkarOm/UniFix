import { useState } from 'react'
import { Flag, Mail, Clock, ChevronRight, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { formatDateShort } from '../utils/dateUtils'
import { SectionHeader } from '../components/SharedComponents'
import { ComplaintModal } from './ComplaintsSection'
import { adminAPI } from '../services/api'

function toTimestamp(ts) {
  if (!ts) return null
  if (typeof ts === 'number') return ts * 1000
  const secs = ts._seconds ?? ts.seconds
  return secs ? secs * 1000 : null
}

function formatElapsed(ts) {
  const ms = toTimestamp(ts)
  if (!ms) return 'N/A'
  const diff = Date.now() - ms
  const totalMins = Math.floor(diff / 60000)
  const hours = Math.floor(totalMins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h ${totalMins % 60}m`
  return `${totalMins}m`
}

export default function FlaggedSection({ allComplaints, loading, onRefresh }) {
  const { tokens } = useTheme()
  const [focused, setFocused] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [msg, setMsg] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const flaggedComplaints = allComplaints.filter(
    c => c.flagged === true && !c.flagResolved && ['pending', 'assigned', 'in_progress'].includes(c.status)
  )

  async function handleIWillHandle(complaintId) {
    try {
      setActionLoading('handle_' + complaintId)
      await adminAPI.iwillHandle(complaintId)
      setMsg('Marked as handling. Student notified.')
      setTimeout(() => setMsg(''), 3000)
      onRefresh()
    } catch (e) {
      setMsg('Action failed: ' + e.message)
    } finally { setActionLoading(null) }
  }

  async function confirmResolve() {
    const complaintId = confirmId
    setConfirmId(null)
    try {
      setActionLoading('resolve_' + complaintId)
      await adminAPI.markFlagResolved(complaintId)
      setMsg('Complaint resolved. HOD and student notified.')
      setTimeout(() => setMsg(''), 3000)
      setFocused(null)
      onRefresh()
    } catch (e) {
      setMsg('Action failed: ' + e.message)
    } finally { setActionLoading(null) }
  }

  const chipStyle = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 700, padding: '2px 8px',
    borderRadius: tokens.radius.pill,
    background: bg, color, border: `1px solid ${border}`,
  })

  return (
    <div>
      <SectionHeader title="Flagged Complaints" subtitle="Escalated complaints requiring immediate attention" />

      {msg && (
        <div style={{
          marginBottom: 16, background: tokens.successBg,
          border: `1px solid ${tokens.successBorder}`,
          borderRadius: tokens.radius.lg, padding: '12px 16px',
          fontSize: 13, fontWeight: 600, color: tokens.success,
        }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : flaggedComplaints.length === 0 ? (
        <div style={{
          background: tokens.surface, borderRadius: tokens.radius.xxl,
          padding: 60, textAlign: 'center', border: `1px solid ${tokens.border}`,
        }}>
          <CheckCircle size={36} color={tokens.border} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.textSecondary, marginBottom: 4 }}>No flagged complaints</div>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>All complaints are within time limits</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {flaggedComplaints.map(item => (
            <div key={item.id} style={{
              background: tokens.surface, borderRadius: tokens.radius.xxl,
              border: `1px solid ${tokens.dangerBorder}`,
              borderLeft: `4px solid ${tokens.danger}`,
              boxShadow: tokens.shadow, overflow: 'hidden',
            }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={chipStyle(tokens.dangerBg, tokens.danger, tokens.dangerBorder)}>
                      <Flag size={10} /> FLAGGED
                    </span>
                    {item.hodEmailSent && (
                      <span style={chipStyle(tokens.warningBg, tokens.warning, tokens.warningBorder)}>
                        <Mail size={10} /> HOD Notified
                      </span>
                    )}
                    {item.adminHandling && (
                      <span style={chipStyle(tokens.infoBg, tokens.info, tokens.infoBorder)}>
                        <ShieldAlert size={10} /> Admin Handling
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setFocused(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 700, color: tokens.success,
                      background: tokens.successBg, border: `1px solid ${tokens.successBorder}`,
                      padding: '5px 10px', borderRadius: tokens.radius.md,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    View <ChevronRight size={12} />
                  </button>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 12 }}>
                  {item.subIssue || item.customIssue || item.category || 'Complaint'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Reported By', value: item.submittedByName || '—', sub: item.submittedByRole },
                    { label: 'Assigned To', value: item.assignedToName || 'Not assigned', sub: item.category },
                  ].map(info => (
                    <div key={info.label} style={{
                      background: tokens.surfaceLow, borderRadius: tokens.radius.lg,
                      padding: 10, border: `1px solid ${tokens.border}`,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', marginBottom: 3 }}>{info.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: tokens.text }}>{info.value}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{info.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: tokens.danger, marginBottom: 12 }}>
                  <Clock size={13} color={tokens.danger} />
                  Flagged {formatElapsed(item.flaggedAt)} ago · {formatDateShort(item.flaggedAt)}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!item.adminHandling ? (
                    <button
                      onClick={() => handleIWillHandle(item.id)}
                      disabled={!!actionLoading}
                      style={{
                        flex: 1, background: tokens.primary, color: '#fff',
                        fontSize: 12, fontWeight: 700, padding: 9,
                        borderRadius: tokens.radius.lg, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        opacity: !!actionLoading ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === 'handle_' + item.id ? 'Processing…' : 'I Will Handle'}
                    </button>
                  ) : (
                    <div style={{
                      flex: 1, background: tokens.infoBg, color: tokens.info,
                      fontSize: 12, fontWeight: 700, padding: 9,
                      borderRadius: tokens.radius.lg, textAlign: 'center',
                      border: `1px solid ${tokens.infoBorder}`,
                    }}>
                      You are handling this
                    </div>
                  )}
                  <button
                    onClick={() => setConfirmId(item.id)}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1, background: tokens.success, color: '#fff',
                      fontSize: 12, fontWeight: 700, padding: 9,
                      borderRadius: tokens.radius.lg, border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                      opacity: !!actionLoading ? 0.5 : 1,
                    }}
                  >
                    {actionLoading === 'resolve_' + item.id ? 'Processing…' : 'Mark as Resolved'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {focused && <ComplaintModal complaint={focused} onClose={() => setFocused(null)} />}

      {confirmId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: tokens.modalOverlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 20, backdropFilter: 'blur(2px)',
          }}
          onClick={() => setConfirmId(null)}
        >
          <div
            style={{
              background: tokens.surface, borderRadius: tokens.radius.xxl,
              width: '100%', maxWidth: 400, boxShadow: tokens.shadowModal,
              border: `1px solid ${tokens.border}`, overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: tokens.radius.xl,
                background: tokens.successBg, border: `1px solid ${tokens.successBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <CheckCircle size={24} color={tokens.success} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Mark as Resolved</div>
              <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                This will mark the complaint as completed. The student will be notified and a resolution email will be sent to the HOD.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{
                  flex: 1, background: tokens.surfaceHigh, color: tokens.textSecondary,
                  border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.lg,
                  padding: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmResolve}
                style={{
                  flex: 1, background: tokens.success, color: '#fff',
                  border: 'none', borderRadius: tokens.radius.lg,
                  padding: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Yes, Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}