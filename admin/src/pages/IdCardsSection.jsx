import { useState } from 'react'
import { X, Eye, CreditCard, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { adminAPI } from '../services/api'
import { formatDateShort } from '../utils/dateUtils'
import { EmptyState, SectionHeader } from '../components/SharedComponents'

export default function IdCardsSection({ requests, loading, onRefresh }) {
  const { tokens } = useTheme()
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  const handleApprove = async (requestId) => {
    setActionLoading(requestId)
    try { await adminAPI.approveIdCard(requestId); onRefresh() }
    catch {} finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal)
    try {
      await adminAPI.rejectIdCard(rejectModal, rejectReason)
      setRejectModal(null)
      setRejectReason('')
      onRefresh()
    } catch {} finally { setActionLoading(null) }
  }

  const statusPill = (status) => ({
    approved: { bg: tokens.successBg, color: tokens.success, border: tokens.successBorder, label: 'Approved', dot: tokens.success },
    rejected: { bg: tokens.dangerBg, color: tokens.danger, border: tokens.dangerBorder, label: 'Rejected', dot: tokens.danger },
    pending: { bg: tokens.warningBg, color: tokens.warning, border: tokens.warningBorder, label: 'Pending', dot: tokens.warning },
  }[status] ?? { bg: tokens.surfaceHigh, color: tokens.textMuted, border: tokens.border, label: status, dot: tokens.textMuted })

  return (
    <div>
      <SectionHeader title="ID Card Requests" subtitle="Review and approve or reject ID card update requests from students and teachers" />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : pendingRequests.length === 0 ? (
        <EmptyState icon={CreditCard} text="No pending ID card requests" sub="All requests have been processed" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
          {pendingRequests.map(req => {
            const pill = statusPill('pending')
            return (
              <div key={req.id} style={{
                background: tokens.surface, borderRadius: tokens.radius.xl,
                border: `1.5px solid ${tokens.warningBorder}`, overflow: 'hidden',
                boxShadow: tokens.shadow,
              }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${tokens.warningBorder}`, background: tokens.warningBg }}>
                  <div style={{ width: 36, height: 36, borderRadius: tokens.radius.lg, background: tokens.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={18} color={tokens.warning} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{req.fullName}</div>
                    <div style={{ fontSize: 11, color: tokens.textMuted }}>{req.email} · {req.role}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: tokens.radius.pill, background: pill.bg, color: pill.color, border: `1px solid ${pill.border}`, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: pill.dot }} /> Pending
                  </span>
                </div>

                <div style={{ padding: 15 }}>
                  {req.newIdCardUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>New ID Card</div>
                      <div style={{ position: 'relative', cursor: 'pointer', borderRadius: tokens.radius.lg, overflow: 'hidden', border: `1px solid ${tokens.border}` }} onClick={() => setPreviewUrl(req.newIdCardUrl)}>
                        <img src={req.newIdCardUrl} alt="New ID" style={{ width: '100%', height: 150, objectFit: 'contain', background: tokens.surfaceLow, display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, gap: 5, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                        >
                          <Eye size={13} /> Preview
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 12 }}>Requested: {formatDateShort(req.requestedAt)}</div>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      style={{ flex: 1, background: tokens.success, color: '#fff', borderRadius: tokens.radius.lg, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', opacity: actionLoading === req.id ? 0.55 : 1 }}
                    >
                      {actionLoading === req.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />} Approve
                    </button>
                    <button
                      onClick={() => { setRejectModal(req.id); setRejectReason('') }}
                      style={{ flex: 1, background: tokens.surface, color: tokens.danger, borderRadius: tokens.radius.lg, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${tokens.dangerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {processedRequests.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 13 }}>Processed Requests</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {processedRequests.map(req => {
              const pill = statusPill(req.status)
              return (
                <div key={req.id} style={{ background: tokens.surface, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.border}`, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: tokens.textSecondary }}>{req.fullName}</span>
                    <span style={{ fontSize: 12, color: tokens.textMuted, marginLeft: 8 }}>{req.email}</span>
                  </div>
                  <span style={{ fontSize: 11, color: tokens.textMuted }}>{formatDateShort(req.processedAt)}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: tokens.radius.pill, background: pill.bg, color: pill.color, border: `1px solid ${pill.border}`, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: pill.dot }} /> {pill.label}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setRejectModal(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth: 460, boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>Reject ID Card Request</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>Optionally provide a reason</div>
              </div>
              <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                style={{ width: '100%', borderRadius: tokens.radius.lg, border: `1.5px solid ${tokens.inputBorder}`, padding: '11px 12px', fontSize: 14, color: tokens.text, background: tokens.inputBg, minHeight: 80, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason (optional)…"
                onFocus={e => e.target.style.borderColor = tokens.inputFocus}
                onBlur={e => e.target.style.borderColor = tokens.inputBorder}
              />
              <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
                <button onClick={() => setRejectModal(null)} style={{ flex: 1, background: tokens.surfaceLow, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleReject} disabled={!!actionLoading} style={{ flex: 1, background: tokens.danger, color: '#fff', border: 'none', borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', opacity: !!actionLoading ? 0.55 : 1 }}>
                  {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />} Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }} onClick={() => setPreviewUrl(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>ID Card Preview</span>
              <button onClick={() => setPreviewUrl(null)} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ overflow: 'auto' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', display: 'block', padding: 8 }} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}