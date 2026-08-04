import { useState } from 'react'
import { X, Eye, IdCard, GraduationCap, BookUser } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { adminAPI } from '../services/api'
import { EmptyState, SectionHeader, TabBar } from '../components/SharedComponents'
import { cap } from '../utils/dateUtils'

export default function StaffUsersSection({ items, activeTab, onTabChange, stats, loading }) {
  const { tokens } = useTheme()
  const [idCardUser, setIdCardUser] = useState(null)
  const [idCardData, setIdCardData] = useState(null)
  const [idCardLoading, setIdCardLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const viewIdCard = async (user) => {
    setIdCardUser(user)
    setIdCardData(null)
    setIdCardLoading(true)
    try {
      const res = await adminAPI.getUserIdCard(user.id)
      setIdCardData(res.data.idCard)
    } catch {} finally { setIdCardLoading(false) }
  }

  const tabs = [
    { key: 'student', label: 'Students', count: stats.students },
    { key: 'teacher', label: 'Teachers', count: stats.teachers },
  ]

  const summaryCards = [
    { label: 'Students', value: stats.students ?? 0, color: tokens.purple, Icon: GraduationCap },
    { label: 'Teachers', value: stats.teachers ?? 0, color: tokens.info, Icon: BookUser },
  ]

  const overlayStyle = {
    position: 'fixed', inset: 0, background: tokens.modalOverlay,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 20, backdropFilter: 'blur(2px)',
  }

  const modalStyle = {
    background: tokens.surface, borderRadius: tokens.radius.xxl,
    width: '100%', maxWidth: 460, maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`,
    overflow: 'hidden',
  }

  return (
    <div>
      <SectionHeader title="Staff & Users" subtitle="All registered students and teachers on the platform" />

      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{
            background: tokens.surface, borderRadius: tokens.radius.xl,
            padding: '16px 24px', border: `1px solid ${tokens.border}`,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: tokens.shadow,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: tokens.radius.lg,
              background: s.color + '18', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <TabBar tabs={tabs} active={activeTab} onChange={onTabChange} />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={activeTab === 'student' ? GraduationCap : BookUser} text={`No ${activeTab}s registered yet`} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {items.map(user => {
            const isStudent = user.role === 'student'
            const accent = isStudent ? tokens.purple : tokens.info
            return (
              <div key={user.id} style={{
                background: tokens.surface, borderRadius: tokens.radius.xl,
                border: `1px solid ${tokens.border}`, overflow: 'hidden',
                boxShadow: tokens.shadow,
              }}>
                <div style={{ height: 4, background: accent }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: tokens.radius.lg,
                      background: accent + '18', color: accent,
                      border: `1.5px solid ${accent}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 800, flexShrink: 0,
                    }}>
                      {user.fullName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>{user.fullName || '—'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 13 }}>
                    {[
                      user.gender && ['Gender', user.gender],
                      isStudent && user.year && ['Year', user.year],
                      isStudent && user.branch && ['Branch', user.branch],
                      !isStudent && user.department && ['Department', user.department],
                      user.phone && ['Phone', user.phone],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: `1px solid ${tokens.border}`,
                      }}>
                        <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500 }}>{k}</span>
                        <span style={{ fontSize: 12, color: tokens.textSecondary, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => viewIdCard(user)}
                    style={{
                      width: '100%', background: tokens.surfaceLow,
                      color: tokens.textSecondary,
                      border: `1.5px solid ${tokens.border}`,
                      borderRadius: tokens.radius.lg, padding: 10,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary }}
                  >
                    <IdCard size={14} /> View ID Card
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {idCardUser && (
        <div style={overlayStyle} onClick={() => { setIdCardUser(null); setIdCardData(null) }}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text }}>ID Card — {idCardUser.fullName}</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {idCardUser.role === 'student' ? <GraduationCap size={12} /> : <BookUser size={12} />}
                  {cap(idCardUser.role)}
                </div>
              </div>
              <button onClick={() => { setIdCardUser(null); setIdCardData(null) }} style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {idCardLoading ? (
                <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
              ) : idCardData ? (() => {
                const url = idCardData.studentIdCardUrl || idCardData.teacherIdCardUrl
                return url ? (
                  <div>
                    <div style={{ position: 'relative', cursor: 'pointer', borderRadius: tokens.radius.lg, overflow: 'hidden', border: `1px solid ${tokens.border}`, marginBottom: 12 }} onClick={() => setPreviewUrl(url)}>
                      <img src={url} alt="ID Card" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block', background: tokens.surfaceLow }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, gap: 5, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <Eye size={14} /> Enlarge
                      </div>
                    </div>
                    <button onClick={() => setPreviewUrl(url)} style={{ width: '100%', background: tokens.text, color: tokens.surface, border: 'none', borderRadius: tokens.radius.lg, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
                      <Eye size={14} /> View Full Size
                    </button>
                  </div>
                ) : <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No ID card uploaded yet</div>
              })() : <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No ID card found</div>}
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
              <img src={previewUrl} alt="ID Card" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', display: 'block', padding: 8 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}