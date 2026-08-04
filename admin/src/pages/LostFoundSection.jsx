import { useState } from 'react'
import { X, Search, Package, PackageCheck, MapPin, Pin, HandMetal, AlertCircle, CheckCircle, Calendar, Phone, Tag, User, Mail } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { formatDateShort, cap } from '../utils/dateUtils'
import { EmptyState, SectionHeader } from '../components/SharedComponents'

export default function LostFoundSection({ items, allItems, lostReports, activeTab, onTabChange, available, handedOver, lrActive, lrFound, loading }) {
  const { tokens } = useTheme()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [focusedReport, setFocusedReport] = useState(null)
  const [focusedFoundItem, setFocusedFoundItem] = useState(null)

  const isLostReportsTab = ['lost_reports', 'lost_active', 'lost_found'].includes(activeTab)

  const tabs = [
    { key: 'found_items', label: 'Found Items', count: allItems.length, section: 'found' },
    { key: 'available', label: 'Available', count: available, section: 'found' },
    { key: 'handed_over', label: 'Handed Over', count: handedOver, section: 'found' },
    { key: 'lost_reports', label: 'Lost Reports', count: lostReports?.length ?? 0, section: 'lost' },
    { key: 'lost_active', label: 'Still Lost', count: lrActive, section: 'lost' },
    { key: 'lost_found', label: 'Found', count: lrFound, section: 'lost' },
  ]

  const statCards = [
    { label: 'Found Items', value: allItems.length, color: tokens.primary, sub: 'Posted by staff' },
    { label: 'Available', value: available, color: tokens.success, sub: 'Waiting to be claimed' },
    { label: 'Handed Over', value: handedOver, color: tokens.success, sub: 'Successfully returned' },
    { label: 'Lost Reports', value: lostReports?.length ?? 0, color: tokens.warning, sub: 'By students/teachers' },
    { label: 'Still Lost', value: lrActive, color: tokens.danger, sub: 'Not yet found' },
    { label: 'Recovered', value: lrFound, color: tokens.purple, sub: 'Marked as found' },
  ]

  const panelStyle = {
    background: tokens.surfaceLow, borderRadius: tokens.radius.xl,
    padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
    border: `1px solid ${tokens.border}`,
  }

  const closeBtn = (onClick) => (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: tokens.radius.md,
      background: tokens.surfaceHigh, border: `1px solid ${tokens.border}`,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: tokens.textSecondary,
    }}>
      <X size={14} />
    </button>
  )

  return (
    <div>
      <SectionHeader title="Lost & Found" subtitle="All items posted by students and teachers across campus" />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10, marginBottom: 24,
      }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: tokens.surface, borderRadius: tokens.radius.xl,
            padding: '18px 16px', border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadow, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', marginBottom: 4 }}>{loading ? '—' : s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Found</span>
        {tabs.filter(t => t.section === 'found').map(tab => (
          <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: tokens.radius.md,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            border: `1.5px solid ${activeTab === tab.key ? tokens.primary : tokens.border}`,
            background: activeTab === tab.key ? tokens.primary : tokens.surface,
            color: activeTab === tab.key ? '#fff' : tokens.textSecondary,
            transition: 'all 0.15s',
          }}>
            {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
              borderRadius: tokens.radius.pill,
              background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : tokens.surfaceHigh,
              color: activeTab === tab.key ? '#fff' : tokens.textMuted,
            }}>{tab.count}</span>
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: tokens.border, margin: '0 4px' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lost</span>
        {tabs.filter(t => t.section === 'lost').map(tab => (
          <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: tokens.radius.md,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            border: `1.5px solid ${activeTab === tab.key ? tokens.warning : tokens.border}`,
            background: activeTab === tab.key ? tokens.warning : tokens.surface,
            color: activeTab === tab.key ? '#fff' : tokens.textSecondary,
            transition: 'all 0.15s',
          }}>
            {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
              borderRadius: tokens.radius.pill,
              background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : tokens.surfaceHigh,
              color: activeTab === tab.key ? '#fff' : tokens.textMuted,
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Search} text="No items found" sub="No lost & found items match this filter" />
      ) : isLostReportsTab ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(report => {
            const isFound = report.status === 'found'
            return (
              <div key={report.id} onClick={() => setFocusedReport(report)} style={{
                background: tokens.surface, borderRadius: tokens.radius.xl,
                border: `1px solid ${isFound ? tokens.successBorder : tokens.dangerBorder}`,
                overflow: 'hidden', boxShadow: tokens.shadow, cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = tokens.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow = tokens.shadow}
              >
                <div style={{
                  padding: '10px 16px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isFound ? tokens.successBg : tokens.dangerBg,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5, color: isFound ? tokens.success : tokens.danger }}>
                    {isFound ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                    {isFound ? 'Found' : 'Still Lost'}
                  </span>
                  <span style={{ fontSize: 10, color: tokens.textMuted }}>{formatDateShort(report.postedAt)}</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: tokens.radius.md,
                      background: tokens.warningBg, border: `1.5px solid ${tokens.warningBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: tokens.warning, flexShrink: 0,
                    }}>{report.postedBy?.name?.[0]?.toUpperCase() ?? '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{report.postedBy?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{cap(report.postedBy?.role)} · {report.postedBy?.email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text, marginBottom: 6 }}>{report.itemName}</div>
                  {report.description && (
                    <div style={{ fontSize: 12, color: tokens.textSecondary, lineHeight: 1.55, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {report.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: tokens.textSecondary, marginBottom: 3 }}>
                    <MapPin size={11} color={tokens.textMuted} />
                    {report.locationLost || report.lastSeenLocation || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: tokens.textMuted }}>
                    <Calendar size={11} color={tokens.textMuted} />
                    {report.dateLost || report.lastSeenDate || '—'}
                  </div>
                  {(report.images?.[0] || report.photoUrl) && (
                    <img src={report.images?.[0] || report.photoUrl} alt={report.itemName} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: tokens.radius.lg, marginTop: 10, border: `1px solid ${tokens.border}` }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(item => {
            const isHandedOver = item.status === 'handed_over'
            return (
              <div key={item.id} onClick={() => setFocusedFoundItem(item)} style={{
                background: tokens.surface, borderRadius: tokens.radius.xl,
                border: `1px solid ${tokens.border}`, overflow: 'hidden',
                boxShadow: tokens.shadow, cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = tokens.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow = tokens.shadow}
              >
                {item.photoUrl ? (
                  <div style={{ position: 'relative' }} onClick={e => { e.stopPropagation(); setPreviewUrl(item.photoUrl) }}>
                    <img src={item.photoUrl} alt={item.itemName} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', background: tokens.surfaceLow }} />
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      {isHandedOver
                        ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: tokens.radius.pill, background: tokens.successBg, color: tokens.success, border: `1px solid ${tokens.successBorder}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PackageCheck size={10} /> Handed Over</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: tokens.radius.pill, background: tokens.success, color: '#fff' }}>Available</span>
                      }
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 110, background: tokens.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${tokens.border}` }}>
                    <Package size={34} color={tokens.border} />
                  </div>
                )}

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: tokens.radius.md,
                      background: tokens.successBg, border: `1.5px solid ${tokens.successBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: tokens.success, flexShrink: 0,
                    }}>{item.postedByName?.[0]?.toUpperCase() ?? '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{item.postedByName || '—'}</div>
                      <div style={{ fontSize: 11, color: tokens.textMuted }}>{cap(item.postedByRole)} · {formatDateShort(item.createdAt)}</div>
                    </div>
                    {!item.photoUrl && (
                      isHandedOver
                        ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: tokens.radius.pill, background: tokens.successBg, color: tokens.success, border: `1px solid ${tokens.successBorder}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}><PackageCheck size={10} /> Handed Over</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: tokens.radius.pill, background: tokens.success, color: '#fff' }}>Available</span>
                    )}
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text, marginBottom: 6 }}>{item.itemName}</div>
                  {item.description && <div style={{ fontSize: 12, color: tokens.textSecondary, lineHeight: 1.55, marginBottom: 8 }}>{item.description}</div>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: tokens.textSecondary, marginBottom: 3 }}>
                    <MapPin size={12} color={tokens.textMuted} />
                    Room {item.roomNumber}{item.roomLabel ? ` — ${item.roomLabel}` : ''}
                  </div>
                  {item.collectLocation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: tokens.success, fontWeight: 500, marginBottom: 3 }}>
                      <Pin size={12} color={tokens.success} />
                      Collect from: {item.collectLocation}
                    </div>
                  )}

                  {isHandedOver && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: tokens.successBg, borderRadius: tokens.radius.lg,
                      padding: '10px 12px', marginTop: 10, border: `1px solid ${tokens.successBorder}`,
                    }}>
                      <HandMetal size={15} color={tokens.success} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.success }}>Handed to {item.handedToName}</div>
                        <div style={{ fontSize: 11, color: tokens.success, opacity: 0.7, marginTop: 1 }}>{formatDateShort(item.handedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }} onClick={() => setPreviewUrl(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Photo</span>
              {closeBtn(() => setPreviewUrl(null))}
            </div>
            <div style={{ overflow: 'auto' }}>
              <img src={previewUrl} alt="Item" style={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', display: 'block', padding: 8 }} />
            </div>
          </div>
        </div>
      )}

      {focusedReport && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setFocusedReport(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: tokens.radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: focusedReport.status === 'found' ? tokens.successBg : tokens.dangerBg }}>
                  {focusedReport.status === 'found' ? <CheckCircle size={20} color={tokens.success} /> : <AlertCircle size={20} color={tokens.danger} />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text }}>{focusedReport.itemName}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: focusedReport.status === 'found' ? tokens.success : tokens.danger }}>
                    {focusedReport.status === 'found' ? 'Found' : 'Still Lost'}
                  </div>
                </div>
              </div>
              {closeBtn(() => setFocusedReport(null))}
            </div>
            <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(focusedReport.images?.length > 0 || focusedReport.photoUrl) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(focusedReport.images?.length > 0 ? focusedReport.images : [focusedReport.photoUrl]).map((url, i) => (
                    <img key={i} src={url} alt={focusedReport.itemName} onClick={() => setPreviewUrl(url)} style={{ height: 160, borderRadius: tokens.radius.lg, objectFit: 'cover', cursor: 'pointer', border: `1px solid ${tokens.border}`, flex: '1 1 140px', maxWidth: '100%' }} />
                  ))}
                </div>
              )}

              <div style={panelStyle}>
                <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Reporter</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: tokens.radius.lg, background: tokens.warningBg, border: `1.5px solid ${tokens.warningBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: tokens.warning, flexShrink: 0 }}>
                    {focusedReport.postedBy?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{focusedReport.postedBy?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: tokens.textSecondary }}>{cap(focusedReport.postedBy?.role)}</div>
                  </div>
                </div>
                {focusedReport.postedBy?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <Mail size={13} color={tokens.textMuted} /> {focusedReport.postedBy.email}
                  </div>
                )}
                {focusedReport.postedBy?.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <User size={13} color={tokens.textMuted} /> {focusedReport.postedBy.department}
                  </div>
                )}
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Item Details</div>
                {focusedReport.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <Tag size={13} color={tokens.textMuted} />
                    <span style={{ fontWeight: 600 }}>Category:</span> {focusedReport.category}
                  </div>
                )}
                {focusedReport.description && (
                  <div style={{ fontSize: 12, color: tokens.textSecondary, lineHeight: 1.6 }}>{focusedReport.description}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                  <MapPin size={13} color={tokens.textMuted} />
                  <span style={{ fontWeight: 600 }}>Lost at:</span> {focusedReport.locationLost || focusedReport.lastSeenLocation || '—'}
                </div>
                {(focusedReport.dateLost || focusedReport.lastSeenDate) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <Calendar size={13} color={tokens.textMuted} />
                    <span style={{ fontWeight: 600 }}>Date:</span> {focusedReport.dateLost || focusedReport.lastSeenDate}
                  </div>
                )}
                {focusedReport.howToReach && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <Phone size={13} color={tokens.textMuted} />
                    <span style={{ fontWeight: 600 }}>Contact:</span> {focusedReport.howToReach}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textMuted }}>
                  <Calendar size={13} color={tokens.textMuted} />
                  Posted: {formatDateShort(focusedReport.postedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {focusedFoundItem && (
        <div style={{ position: 'fixed', inset: 0, background: tokens.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(2px)' }} onClick={() => setFocusedFoundItem(null)}>
          <div style={{ background: tokens.surface, borderRadius: tokens.radius.xxl, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: tokens.shadowModal, border: `1px solid ${tokens.border}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${tokens.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: tokens.radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: focusedFoundItem.status === 'handed_over' ? tokens.successBg : tokens.infoBg }}>
                  {focusedFoundItem.status === 'handed_over' ? <PackageCheck size={20} color={tokens.success} /> : <Package size={20} color={tokens.info} />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text }}>{focusedFoundItem.itemName}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: focusedFoundItem.status === 'handed_over' ? tokens.success : tokens.info }}>
                    {focusedFoundItem.status === 'handed_over' ? 'Handed Over' : 'Available'}
                  </div>
                </div>
              </div>
              {closeBtn(() => setFocusedFoundItem(null))}
            </div>
            <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {focusedFoundItem.photoUrl && (
                <img src={focusedFoundItem.photoUrl} alt={focusedFoundItem.itemName} onClick={() => setPreviewUrl(focusedFoundItem.photoUrl)} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: tokens.radius.xl, cursor: 'pointer', border: `1px solid ${tokens.border}` }} />
              )}

              <div style={panelStyle}>
                <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Posted By</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: tokens.radius.lg, background: tokens.successBg, border: `1.5px solid ${tokens.successBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: tokens.success, flexShrink: 0 }}>
                    {focusedFoundItem.postedByName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>{focusedFoundItem.postedByName || '—'}</div>
                    <div style={{ fontSize: 11, color: tokens.textSecondary }}>{cap(focusedFoundItem.postedByRole)}</div>
                  </div>
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: 10, fontWeight: 700, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Item Details</div>
                {focusedFoundItem.description && (
                  <div style={{ fontSize: 12, color: tokens.textSecondary, lineHeight: 1.6 }}>{focusedFoundItem.description}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                  <MapPin size={13} color={tokens.textMuted} />
                  <span style={{ fontWeight: 600 }}>Found at:</span> Room {focusedFoundItem.roomNumber}{focusedFoundItem.roomLabel ? ` — ${focusedFoundItem.roomLabel}` : ''}
                </div>
                {focusedFoundItem.collectLocation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.success, fontWeight: 500 }}>
                    <Pin size={13} color={tokens.success} />
                    <span style={{ fontWeight: 600 }}>Collect from:</span> {focusedFoundItem.collectLocation}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textMuted }}>
                  <Calendar size={13} color={tokens.textMuted} />
                  Posted: {formatDateShort(focusedFoundItem.createdAt)}
                </div>
              </div>

              {focusedFoundItem.status === 'handed_over' && (
                <div style={{ background: tokens.successBg, borderRadius: tokens.radius.xl, padding: 14, border: `1px solid ${tokens.successBorder}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tokens.success, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Handover Details</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <User size={13} color={tokens.success} />
                    <span style={{ fontWeight: 600 }}>Handed to:</span> {focusedFoundItem.handedToName || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: tokens.textSecondary }}>
                    <Calendar size={13} color={tokens.success} />
                    <span style={{ fontWeight: 600 }}>Handed at:</span> {formatDateShort(focusedFoundItem.handedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}