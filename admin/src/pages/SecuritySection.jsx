import { useState } from 'react'
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { adminAPI } from '../services/api'
import { formatDateShort, cap } from '../utils/dateUtils'
import { EmptyState, SectionHeader } from '../components/SharedComponents'

export default function SecuritySection({ issues, loading, onRefresh }) {
  const { tokens } = useTheme()
  const [actionLoading, setActionLoading] = useState(null)
  const [resolveModal, setResolveModal] = useState(null)
  const [resolution, setResolution] = useState('')

  const openIssues = issues.filter(i => i.status === 'open')
  const resolvedIssues = issues.filter(i => i.status === 'resolved')

  const handleResolve = async () => {
    if (!resolveModal) return
    setActionLoading(resolveModal)
    try {
      await adminAPI.resolveSecurityIssue(resolveModal, resolution)
      setResolveModal(null)
      setResolution('')
      onRefresh()
    } catch {} finally { setActionLoading(null) }
  }

  return (
    <div>
      <SectionHeader title="Security Issues" subtitle="Review and resolve security issues reported by users" />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : openIssues.length === 0 ? (
        <EmptyState icon={ShieldAlert} text="No open security issues" sub="All issues have been resolved" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {openIssues.map(issue => (
            <div key={issue.id} style={{
              background: tokens.surface, borderRadius: tokens.radius.xl,
              border: `1.5px solid ${tokens.warningBorder}`, padding: 20,
              boxShadow: tokens.shadow,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: tokens.radius.lg, background: tokens.warningBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldAlert size={20} color={tokens.warning} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{issue.issueType}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: tokens.radius.pill, background: tokens.warningBg, color: tokens.warning, border: `1px solid ${tokens.warningBorder}` }}>
                      <AlertTriangle size={9} /> Open
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: tokens.textSecondary, lineHeight: 1.55, marginBottom: 8 }}>{issue.description}</div>
                  <div style={{ fontSize: 12, color: tokens.textMuted }}>
                    Reported by <strong style={{ color: tokens.textSecondary }}>{issue.fullName}</strong> ({cap(issue.role)}) · {issue.email} · {formatDateShort(issue.reportedAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setResolveModal(issue.id); setResolution('') }}
                style={{ background: tokens.text, color: tokens.surface, borderRadius: tokens.radius.lg, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
              >
                <CheckCircle2 size={14} /> Mark as Resolved
              </button>
            </div>
          ))}
        </div>
      )}

      {resolvedIssues.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 13 }}>Resolved Issues</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {resolvedIssues.map(issue => (
              <div key={issue.id} style={{ background: tokens.surfaceLow, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tokens.textSecondary, marginBottom: 2 }}>{issue.issueType}</div>
                  <div style={{ fontSize: 12, color: tokens.textMuted }}>{issue.fullName} · {formatDateShort(issue.reportedAt)}</div>
                  {issue.resolution && <div style={{ fontSize: 12, color: tokens.success, marginTop: 4 }}>Resolution: {issue.resolution}</div>}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: tokens.radius.pill, background: tokens.successBg, color: tokens.success, border: `1px solid ${tokens.successBorder}`, whiteSpace: 'nowrap' }}>
                  <CheckCircle2 size={10} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {resolveModal && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setResolveModal(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth: 460, boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>Resolve Security Issue</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>Add a resolution note (optional)</div>
              </div>
              <button onClick={() => setResolveModal(null)} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                style={{ width: '100%', borderRadius: tokens.radius.lg, border: `1.5px solid ${tokens.inputBorder}`, padding: '11px 12px', fontSize: 14, color: tokens.text, background: tokens.inputBg, minHeight: 80, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Describe how this was resolved…"
                onFocus={e => e.target.style.borderColor = tokens.inputFocus}
                onBlur={e => e.target.style.borderColor = tokens.inputBorder}
              />
              <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                <button onClick={() => setResolveModal(null)} style={{ flex: 1, background: tokens.surfaceLow, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleResolve} disabled={!!actionLoading} style={{ flex: 1, background: tokens.success, color: '#fff', border: 'none', borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', opacity: !!actionLoading ? 0.55 : 1 }}>
                  {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />} Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}