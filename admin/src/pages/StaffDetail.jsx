import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { useTheme } from '../theme/ThemeProvider'
import {
  ArrowLeft, CheckCircle2, XCircle, Eye, FileText,
  AlertCircle, Loader2, X, ShieldCheck, IdCard,
  Briefcase, Phone, Mail, Clock, Hash,
} from 'lucide-react'

export default function StaffDetail() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { tokens } = useTheme()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectionText, setRejectionText] = useState('')
  const [rejectionError, setRejectionError] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true)
      try {
        const res = await adminAPI.getStaff(uid)
        setStaff(res.data.staff)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('unifix_admin_token')
          navigate('/login')
        } else { setError('Failed to load staff details.') }
      } finally { setLoading(false) }
    }
    fetchStaff()
  }, [uid, navigate])

  const handleApprove = async () => {
    setActionLoading(true)
    setError('')
    try {
      await adminAPI.approveStaff(uid)
      setSuccessMsg('Staff approved successfully. They will be notified via email.')
      setStaff(prev => ({ ...prev, verificationStatus: 'approved' }))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve staff.')
    } finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    setRejectionError('')
    if (!rejectionText.trim()) return setRejectionError('Please enter a rejection reason.')
    if (rejectionText.trim().length < 10) return setRejectionError('Please provide a more detailed reason.')
    setActionLoading(true)
    try {
      await adminAPI.rejectStaff(uid, rejectionText.trim())
      setSuccessMsg('Staff rejected and notified via email.')
      setStaff(prev => ({ ...prev, verificationStatus: 'rejected', rejectionMessage: rejectionText.trim() }))
      setRejectModal(false)
      setRejectionText('')
    } catch (err) {
      setRejectionError(err.response?.data?.error || 'Failed to reject staff.')
    } finally { setActionLoading(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: tokens.radius.xl, background: tokens.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Loader2 size={26} color={tokens.primary} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <div style={{ color: tokens.textMuted, fontSize: 14, fontWeight: 500 }}>Loading staff profile…</div>
      </div>
    </div>
  )

  if (error && !staff) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: tokens.radius.xl, background: tokens.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={26} color={tokens.danger} />
        </div>
        <div style={{ color: tokens.danger, fontSize: 14, fontWeight: 500, marginBottom: 18 }}>{error}</div>
        <button onClick={() => navigate('/')} style={{ background: tokens.surface, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.lg, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, margin: '0 auto', fontFamily: 'inherit' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    </div>
  )

  const statusStyles = {
    pending: { bg: tokens.warningBg, color: tokens.warning, border: tokens.warningBorder },
    approved: { bg: tokens.successBg, color: tokens.success, border: tokens.successBorder },
    rejected: { bg: tokens.dangerBg, color: tokens.danger, border: tokens.dangerBorder },
  }
  const sc = statusStyles[staff?.verificationStatus] ?? statusStyles.pending

  const infoRows = [
    { label: 'Employee ID', value: staff?.employeeId, Icon: Hash },
    { label: 'Designation', value: staff?.designation, Icon: Briefcase },
    { label: 'Experience', value: staff?.experience ? `${staff.experience} years` : null, Icon: Clock },
    { label: 'Phone', value: staff?.phone, Icon: Phone },
    { label: 'Email', value: staff?.email, Icon: Mail },
    { label: 'Joined', value: staff?.createdAt?.seconds ? new Date(staff.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null, Icon: Clock },
  ]

  const docs = [
    { title: 'ID Card', Icon: IdCard, url: staff?.idCardUrl, fileName: staff?.idCardName },
    { title: 'Certificate / Proof', Icon: FileText, url: staff?.certificateUrl, fileName: staff?.certificateName },
  ]

  const cardStyle = {
    background: tokens.surface, borderRadius: tokens.radius.xxl,
    border: `1px solid ${tokens.border}`, overflow: 'hidden', boxShadow: tokens.shadow,
  }

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: "'Inter', 'DM Sans', sans-serif", paddingBottom: 60 }}>
      <header style={{ height: 56, background: tokens.headerBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `1px solid ${tokens.headerBorder}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: tokens.surfaceHigh, border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.md, padding: '7px 13px', fontSize: 13, fontWeight: 600, color: tokens.textSecondary, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            <ArrowLeft size={13} /> Back
          </button>
          <div style={{ width: 1, height: 22, background: tokens.border }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Staff Profile</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: tokens.radius.pill, border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} />
          {staff?.verificationStatus?.toUpperCase()}
        </span>
      </header>

      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '28px 24px' }}>
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, borderRadius: tokens.radius.lg, padding: '12px 16px', fontSize: 13, fontWeight: 500, marginBottom: 20, border: `1px solid ${tokens.successBorder}`, background: tokens.successBg, color: tokens.success }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {successMsg}
          </div>
        )}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, borderRadius: tokens.radius.lg, padding: '12px 16px', fontSize: 13, fontWeight: 500, marginBottom: 20, border: `1px solid ${tokens.dangerBorder}`, background: tokens.dangerBg, color: tokens.danger }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,320px) 1fr', gap: 20, alignItems: 'start' }} className="staff-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ height: 5, background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.primaryHover})` }} />
              <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 54, height: 54, borderRadius: tokens.radius.xl, background: tokens.primaryLight, border: `1.5px solid ${tokens.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: tokens.primary, flexShrink: 0 }}>
                    {staff?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: tokens.text, marginBottom: 3 }}>{staff?.fullName}</div>
                    <div style={{ fontSize: 12, color: tokens.textMuted }}>{staff?.designation || 'Maintenance Staff'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {infoRows.filter(i => i.value).map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${tokens.border}` }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textMuted, fontWeight: 500 }}>
                        <item.Icon size={12} /> {item.label}
                      </span>
                      <span style={{ fontSize: 12, color: tokens.textSecondary, fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-words' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {staff?.verificationStatus === 'rejected' && staff?.rejectionMessage && (
              <div style={{ background: tokens.dangerBg, border: `1px solid ${tokens.dangerBorder}`, borderRadius: tokens.radius.xl, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: tokens.danger, marginBottom: 8 }}>
                  <XCircle size={14} /> Rejection Reason
                </div>
                <p style={{ fontSize: 13, color: tokens.danger, lineHeight: 1.6, opacity: 0.85 }}>{staff.rejectionMessage}</p>
              </div>
            )}

            {staff?.verificationStatus === 'pending' && (
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 5 }}>Admin Actions</div>
                <p style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 18, lineHeight: 1.5 }}>Review the documents carefully before taking action.</p>
                <button onClick={handleApprove} disabled={actionLoading} style={{ width: '100%', borderRadius: tokens.radius.lg, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, background: tokens.success, color: '#fff', border: 'none', fontFamily: 'inherit', opacity: actionLoading ? 0.65 : 1 }}>
                  {actionLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={15} />} Approve Staff
                </button>
                <button onClick={() => setRejectModal(true)} disabled={actionLoading} style={{ width: '100%', borderRadius: tokens.radius.lg, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: tokens.surface, color: tokens.danger, border: `1.5px solid ${tokens.dangerBorder}`, fontFamily: 'inherit', opacity: actionLoading ? 0.65 : 1 }}>
                  <XCircle size={15} /> Reject & Notify
                </button>
              </div>
            )}

            {staff?.verificationStatus === 'approved' && (
              <div style={{ background: tokens.successBg, borderRadius: tokens.radius.xl, padding: 22, border: `1.5px solid ${tokens.successBorder}`, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: tokens.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ShieldCheck size={24} color="#fff" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: tokens.success, marginBottom: 4 }}>Approved & Active</div>
                <div style={{ fontSize: 12, color: tokens.success, lineHeight: 1.5, opacity: 0.8 }}>This staff member can now receive and manage complaints.</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...cardStyle, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Uploaded Documents</div>
              <p style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 20 }}>Click on any image to enlarge. PDFs will open in a new tab.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {docs.map(doc => {
                  const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf')
                  const hasDoc = !!doc.url
                  return (
                    <div key={doc.title} style={{ border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius.xl, overflow: 'hidden', background: tokens.surfaceLow }}>
                      {hasDoc && !isPdf ? (
                        <div style={{ position: 'relative', height: 175, cursor: 'pointer', overflow: 'hidden' }} onClick={() => setPreviewDoc({ url: doc.url, title: doc.title })}>
                          <img src={doc.url} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, gap: 6, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                          >
                            <Eye size={14} /> Enlarge
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens.surfaceHigh }}>
                          <doc.Icon size={38} color={tokens.border} />
                        </div>
                      )}
                      <div style={{ padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.textSecondary, marginBottom: 3 }}>{doc.title}</div>
                        {doc.fileName && <div style={{ fontSize: 10, color: tokens.textMuted, marginBottom: 10, wordBreak: 'break-all' }}>{doc.fileName}</div>}
                        {hasDoc ? (
                          <button onClick={() => isPdf ? window.open(doc.url, '_blank') : setPreviewDoc({ url: doc.url, title: doc.title })} style={{ background: tokens.surfaceHigh, color: tokens.textSecondary, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius.md, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
                            {isPdf ? <><FileText size={12} /> View PDF</> : <><Eye size={12} /> Full Size</>}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: tokens.textMuted, fontStyle: 'italic' }}>Not uploaded</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: tokens.shadowModal }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>{previewDoc.title}</span>
              <button onClick={() => setPreviewDoc(null)} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ overflow: 'auto', padding: 4 }}>
              <img src={previewDoc.url} alt={previewDoc.title} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setRejectModal(false)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, padding: 32, width: '100%', maxWidth: 460, boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.text, marginBottom: 6 }}>Reject Staff Profile</div>
            <p style={{ fontSize: 13, color: tokens.textMuted, marginBottom: 18, lineHeight: 1.6 }}>This message will be shown to the staff member in the app and sent via email.</p>
            <textarea
              style={{ width: '100%', borderRadius: tokens.radius.lg, border: `1.5px solid ${tokens.inputBorder}`, padding: '12px 14px', fontSize: 13, color: tokens.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none', background: tokens.inputBg, minHeight: 100, marginBottom: 10 }}
              placeholder="e.g. Your ID card is not clearly visible. Please re-upload a clearer photo."
              value={rejectionText} onChange={e => setRejectionText(e.target.value)} rows={4}
              onFocus={e => e.target.style.borderColor = tokens.inputFocus}
              onBlur={e => e.target.style.borderColor = tokens.inputBorder}
            />
            {rejectionError && (
              <div style={{ background: tokens.dangerBg, color: tokens.danger, border: `1px solid ${tokens.dangerBorder}`, borderRadius: tokens.radius.md, padding: '8px 12px', fontSize: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} /> {rejectionError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRejectModal(false); setRejectionText(''); setRejectionError('') }} style={{ flex: 1, borderRadius: tokens.radius.lg, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: tokens.surfaceHigh, color: tokens.textSecondary, border: `1.5px solid ${tokens.border}`, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleReject} disabled={actionLoading} style={{ flex: 1, borderRadius: tokens.radius.lg, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: tokens.danger, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', opacity: actionLoading ? 0.65 : 1 }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />} Reject & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .staff-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}