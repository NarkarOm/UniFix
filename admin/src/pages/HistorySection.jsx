import { useState } from 'react'
import { Flag, Mail, CheckCircle, Clock, ChevronRight, Star } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { formatDateShort } from '../utils/dateUtils'
import { SectionHeader, TabBar } from '../components/SharedComponents'
import { ComplaintModal } from './ComplaintsSection'

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

function formatResolutionTime(acceptedAt, completedAt) {
  const start = toTimestamp(acceptedAt)
  const end = toTimestamp(completedAt)
  if (!start || !end) return 'N/A'
  const diff = end - start
  const totalMins = Math.floor(diff / 60000)
  const hours = Math.floor(totalMins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h ${totalMins % 60}m`
  return `${totalMins}m`
}

export default function HistorySection({ allComplaints, loading }) {
  const { tokens } = useTheme()
  const [activeTab, setActiveTab] = useState('flagged')
  const [focused, setFocused] = useState(null)

  const completedComplaints = allComplaints.filter(c => c.status === 'completed' && c.flagged === true)
  const flaggedActive = allComplaints.filter(c => c.flagged === true && !c.flagResolved && c.status !== 'completed')
  const flaggedResolved = allComplaints.filter(c => c.flagged === true && c.flagResolved === true && c.status !== 'completed')
  const allFlagged = [...flaggedActive, ...flaggedResolved]

  const tabs = [
    { key: 'flagged', label: 'Flagged', count: allFlagged.length },
    { key: 'completed', label: 'Completed (Flagged)', count: completedComplaints.length },
  ]

  const cardBase = {
    background: tokens.surface, borderRadius: tokens.radius.xl,
    padding: 16, boxShadow: tokens.shadow,
    cursor: 'pointer', transition: 'all 0.15s',
    border: `1px solid ${tokens.border}`,
  }

  return (
    <div>
      <SectionHeader title="Resolution History" subtitle="Flagged complaints and resolved escalations" />

      <div style={{ marginBottom: 20 }}>
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : activeTab === 'flagged' ? (
        allFlagged.length === 0 ? (
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, padding: 48, textAlign: 'center', border: `1px solid ${tokens.border}` }}>
            <Flag size={32} color={tokens.border} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.textSecondary, marginBottom: 4 }}>No flagged complaints</div>
            <div style={{ fontSize: 12, color: tokens.textMuted }}>Escalated complaints will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allFlagged.map(item => {
              const isResolved = item.flagResolved === true
              return (
                <div
                  key={item.id}
                  onClick={() => setFocused(item)}
                  style={{
                    ...cardBase,
                    borderLeft: `4px solid ${isResolved ? tokens.success : tokens.danger}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = tokens.shadowMd}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = tokens.shadow}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        borderRadius: tokens.radius.pill,
                        background: isResolved ? tokens.successBg : tokens.dangerBg,
                        color: isResolved ? tokens.success : tokens.danger,
                        border: `1px solid ${isResolved ? tokens.successBorder : tokens.dangerBorder}`,
                      }}>
                        {isResolved ? <CheckCircle size={10} /> : <Flag size={10} />}
                        {isResolved ? 'RESOLVED' : 'FLAGGED'}
                      </span>
                      {item.hodEmailSent && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, padding: '2px 8px',
                          borderRadius: tokens.radius.pill,
                          background: tokens.surfaceHigh, color: tokens.textMuted,
                          border: `1px solid ${tokens.border}`,
                        }}>
                          <Mail size={10} /> HOD Notified
                        </span>
                      )}
                    </div>
                    <ChevronRight size={15} color={tokens.textMuted} />
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>
                    {item.subIssue || item.customIssue || item.category || 'Complaint'}
                  </div>

                  {item.assignedToName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tokens.textMuted, marginBottom: 6 }}>
                      <Clock size={12} color={tokens.textMuted} />
                      Assigned to: {item.assignedToName}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: isResolved ? tokens.success : tokens.danger, marginBottom: 10 }}>
                    <Clock size={12} color={isResolved ? tokens.success : tokens.danger} />
                    {isResolved
                      ? `Resolved in ${formatResolutionTime(item.acceptedAt, item.completedAt)}`
                      : item.flaggedAt ? `Flagged ${formatElapsed(item.flaggedAt)} ago` : 'Flagged'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${tokens.border}` }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {item.category || 'N/A'}
                    </span>
                    <span style={{ fontSize: 11, color: tokens.textMuted }}>{formatDateShort(item.flaggedAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        completedComplaints.length === 0 ? (
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, padding: 48, textAlign: 'center', border: `1px solid ${tokens.border}` }}>
            <CheckCircle size={32} color={tokens.border} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.textSecondary, marginBottom: 4 }}>No completed flagged complaints</div>
            <div style={{ fontSize: 12, color: tokens.textMuted }}>Resolved escalated complaints will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completedComplaints.map(item => (
              <div
                key={item.id}
                onClick={() => setFocused(item)}
                style={{ ...cardBase, borderLeft: `4px solid ${tokens.success}` }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = tokens.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow = tokens.shadow}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: tokens.radius.pill,
                    background: tokens.successBg, color: tokens.success,
                    border: `1px solid ${tokens.successBorder}`,
                  }}>
                    <CheckCircle size={10} /> COMPLETED
                  </span>
                  <ChevronRight size={15} color={tokens.textMuted} />
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>
                  {item.subIssue || item.customIssue || item.category || 'Complaint'}
                </div>

                {item.assignedToName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tokens.textMuted, marginBottom: 6 }}>
                    <Clock size={12} color={tokens.textMuted} />
                    Staff: {item.assignedToName}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: tokens.success, marginBottom: 10 }}>
                  <CheckCircle size={12} color={tokens.success} />
                  Resolved in {formatResolutionTime(item.acceptedAt, item.completedAt)}
                </div>

                {item.rating !== null && item.rating !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={13} color={i <= item.rating ? tokens.warning : tokens.border} fill={i <= item.rating ? tokens.warning : 'none'} />
                    ))}
                    <span style={{ fontSize: 12, fontWeight: 700, color: tokens.warning, marginLeft: 4 }}>{item.rating}/5</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${tokens.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {item.category || 'N/A'}
                  </span>
                  <span style={{ fontSize: 11, color: tokens.success, fontWeight: 600 }}>View Log</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {focused && <ComplaintModal complaint={focused} onClose={() => setFocused(null)} />}
    </div>
  )
}