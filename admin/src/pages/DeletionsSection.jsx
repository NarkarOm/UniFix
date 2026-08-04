import { useState } from 'react'
import { X, Wrench, User, Users, Trash2, Lock, CheckCircle2, Loader2, GraduationCap, BookUser } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { adminAPI } from '../services/api'
import { formatDate, formatDateShort, cap } from '../utils/dateUtils'
import { EmptyState, SectionHeader } from '../components/SharedComponents'

export default function DeletionsSection({ data, loading, onRefresh }) {
  const { tokens } = useTheme()
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const staffRequests = data.staffRequests ?? []
  const userDeletions = data.userDeletions ?? []
  const pendingStaff = staffRequests.filter(r => r.status === 'pending')
  const processedStaff = staffRequests.filter(r => r.status !== 'pending')

  const handleApprove = async (requestId) => {
    setActionLoading(requestId)
    try { await adminAPI.approveDeletion(requestId); onRefresh() }
    catch {} finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal)
    try {
      await adminAPI.rejectDeletion(rejectModal, rejectReason)
      setRejectModal(null)
      setRejectReason('')
      onRefresh()
    } catch {} finally { setActionLoading(null) }
  }

  const colStyle = { display: 'flex', flexDirection: 'column', gap: 0 }

  return (
    <div>
      <SectionHeader title="Account Deletions" subtitle="Monitor student/teacher deletions and approve or reject staff deletion requests" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={15} color={tokens.danger} />
            Staff Deletion Requests
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: tokens.radius.pill, background: tokens.dangerBg, color: tokens.danger }}>Action Required</span>
          </div>

          {loading ? (
            <div style={{ color: tokens.textMuted, padding: 16, fontSize: 13 }}>Loading…</div>
          ) : pendingStaff.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="No pending staff deletion requests" />
          ) : (
            <div style={colStyle}>
              {pendingStaff.map(req => (
                <div key={req.id} style={{ background: tokens.surface, borderRadius: tokens.radius.xl, border: `1px solid ${tokens.dangerBorder}`, padding: 16, marginBottom: 12, boxShadow: tokens.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: tokens.radius.lg, background: tokens.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Trash2 size={16} color={tokens.danger} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{req.fullName}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{req.email} · {req.designation}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 12 }}>Requested: {formatDate(req.requestedAt)}</div>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <button onClick={() => handleApprove(req.id)} disabled={actionLoading === req.id} style={{ flex: 1, background: tokens.danger, color: '#fff', borderRadius: tokens.radius.lg, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', opacity: actionLoading === req.id ? 0.55 : 1 }}>
                      {actionLoading === req.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />} Delete Account
                    </button>
                    <button onClick={() => { setRejectModal(req.id); setRejectReason('') }} style={{ flex: 1, background: tokens.surfaceLow, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
                      <Lock size={13} /> Keep Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {processedStaff.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.text, marginBottom: 13 }}>Processed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {processedStaff.map(req => (
                  <div key={req.id} style={{ background: tokens.surfaceLow, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.border}`, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: tokens.textSecondary }}>{req.fullName}</span>
                    </div>
                    <span style={{ fontSize: 11, color: tokens.textMuted }}>{formatDateShort(req.processedAt)}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 700, padding: '3px 10px',
                      borderRadius: tokens.radius.pill, whiteSpace: 'nowrap',
                      background: req.status === 'approved' ? tokens.dangerBg : tokens.successBg,
                      color: req.status === 'approved' ? tokens.danger : tokens.success,
                      border: `1px solid ${req.status === 'approved' ? tokens.dangerBorder : tokens.successBorder}`,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: req.status === 'approved' ? tokens.danger : tokens.success }} />
                      {req.status === 'approved' ? 'Deleted' : 'Kept'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={15} color={tokens.textMuted} />
            Student / Teacher Deletions
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: tokens.radius.pill, background: tokens.surfaceHigh, color: tokens.textMuted }}>Info only</span>
          </div>

          {loading ? (
            <div style={{ color: tokens.textMuted, padding: 16, fontSize: 13 }}>Loading…</div>
          ) : userDeletions.length === 0 ? (
            <EmptyState icon={Users} text="No account deletions yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {userDeletions.map(log => (
                <div key={log.id} style={{ background: tokens.surface, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.border}`, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: tokens.radius.md,
                    background: log.role === 'student' ? tokens.purpleBg : tokens.infoBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {log.role === 'student' ? <GraduationCap size={14} color={tokens.purple} /> : <BookUser size={14} color={tokens.info} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tokens.textSecondary }}>{log.fullName}</div>
                    <div style={{ fontSize: 11, color: tokens.textMuted }}>{log.email} · {cap(log.role)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, textAlign: 'right' }}>{formatDate(log.deletedAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setRejectModal(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth: 460, boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>Keep Account</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>Provide a reason for rejecting the deletion request</div>
              </div>
              <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                style={{ width: '100%', borderRadius: tokens.radius.lg, border: `1.5px solid ${tokens.inputBorder}`, padding: '11px 12px', fontSize: 14, color: tokens.text, background: tokens.inputBg, minHeight: 80, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason (optional)…"
                onFocus={e => e.target.style.borderColor = tokens.inputFocus}
                onBlur={e => e.target.style.borderColor = tokens.inputBorder}
              />
              <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                <button onClick={() => setRejectModal(null)} style={{ flex: 1, background: tokens.surfaceLow, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleReject} disabled={!!actionLoading} style={{ flex: 1, background: tokens.success, color: '#fff', border: 'none', borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', opacity: !!actionLoading ? 0.55 : 1 }}>
                  {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />} Keep Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}