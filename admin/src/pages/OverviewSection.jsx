import { ChevronRight, CreditCard, Trash2, ShieldAlert, Zap, Droplets, Hammer, Sparkles, Monitor, Shield, Bath, FileText } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { SectionHeader, StatusBadge } from '../components/SharedComponents'
import AnalyticsSection from './AnalyticsSection'
import { CATEGORY } from '../constants'
import { formatDateShort } from '../utils/dateUtils'

const CATEGORY_ICONS = {
  electrical: Zap, plumbing: Droplets, carpentry: Hammer,
  cleaning: Sparkles, technician: Monitor, safety: Shield,
  washroom: Bath, others: FileText,
}

export default function OverviewSection({ stats, cs, complaints, onNavigate, loading }) {
  const { tokens } = useTheme()
  const recent = complaints.slice(0, 6)

  const statCards = [
    { label: 'Total Complaints', value: cs.total ?? 0, sub: `${cs.pending ?? 0} pending`, color: tokens.warning, section: 'complaints' },
    { label: 'Pending', value: cs.pending ?? 0, sub: 'Requires attention', color: tokens.danger, section: 'complaints' },
    { label: 'In Progress', value: cs.in_progress ?? 0, sub: 'Staff assigned', color: tokens.purple, section: 'complaints' },
    { label: 'Resolved', value: cs.completed ?? 0, sub: `${cs.total ? Math.round((cs.completed / cs.total) * 100) : 0}% success rate`, color: tokens.success, section: 'complaints' },
    { label: 'Students', value: stats.students ?? 0, sub: 'Active profiles', color: tokens.primary, section: 'users' },
    { label: 'Active Staff', value: stats.approved ?? 0, sub: 'Verified staff', color: tokens.info, section: 'staff' },
  ]

  const alertCards = [
    stats.pendingIdCardRequests > 0 && {
      key: 'idcards', Icon: CreditCard, value: stats.pendingIdCardRequests,
      label: 'Pending ID Card Requests',
      bg: tokens.warningBg, border: tokens.warningBorder, color: tokens.warning,
    },
    stats.pendingDeletionRequests > 0 && {
      key: 'deletions', Icon: Trash2, value: stats.pendingDeletionRequests,
      label: 'Pending Deletion Requests',
      bg: tokens.dangerBg, border: tokens.dangerBorder, color: tokens.danger,
    },
    stats.openSecurityIssues > 0 && {
      key: 'security', Icon: ShieldAlert, value: stats.openSecurityIssues,
      label: 'Open Security Issues',
      bg: tokens.warningBg, border: tokens.warningBorder, color: tokens.warning,
    },
  ].filter(Boolean)

  return (
    <div>
      <SectionHeader title="Campus Overview" subtitle="Welcome back. Here's what's happening across campus today." />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        {statCards.map(card => (
          <div
            key={card.label}
            onClick={() => onNavigate(card.section)}
            style={{
              background: tokens.surface, border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radius.xl, padding: '18px 16px',
              cursor: 'pointer', transition: 'all 0.18s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = tokens.shadowMd
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color, letterSpacing: '-0.04em', marginBottom: 6 }}>
              {loading ? '—' : card.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: tokens.textMuted }}>{card.sub}</div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              background: card.color, opacity: 0, transition: 'opacity 0.18s',
            }} className="stat-bar" />
          </div>
        ))}
      </div>

      {alertCards.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {alertCards.map(card => (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              style={{
                background: card.bg, border: `1.5px solid ${card.border}`,
                borderRadius: tokens.radius.xl, padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = tokens.shadowMd }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: tokens.radius.lg,
                background: tokens.surface, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <card.Icon size={18} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: card.color, marginTop: 3, opacity: 0.8 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <AnalyticsSection complaints={complaints} loading={loading} />
      </div>

      <div style={{
        background: tokens.surface, borderRadius: tokens.radius.xxl,
        border: `1px solid ${tokens.border}`, overflow: 'hidden',
        boxShadow: tokens.shadow, marginTop: 24,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', borderBottom: `1px solid ${tokens.border}`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Recent Activity</span>
          <button
            onClick={() => onNavigate('complaints')}
            style={{
              background: 'none', border: 'none', color: tokens.primary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
            }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: tokens.tableHeadBg }}>
                {['Complaint', 'Location', 'Reported By', 'Status', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '10px 18px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: tokens.textMuted,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    borderBottom: `1px solid ${tokens.border}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>Loading…</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No complaints yet</td></tr>
              ) : recent.map(c => {
                const catMeta = CATEGORY[c.category] ?? CATEGORY.others
                const CatIcon = CATEGORY_ICONS[c.category] ?? CATEGORY_ICONS.others
                return (
                  <tr key={c.id}
                    style={{ transition: 'background 0.1s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = tokens.tableRowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: tokens.radius.md, background: catMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CatIcon size={14} color={catMeta.color} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>{c.subIssue || c.customIssue || 'Issue Reported'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 13, color: tokens.textSecondary }}>{[c.building, c.roomDetail].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 13, color: tokens.textSecondary, fontWeight: 500 }}>{c.submittedByName || '—'}</td>
                    <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}` }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 12, color: tokens.textMuted }}>{formatDateShort(c.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}