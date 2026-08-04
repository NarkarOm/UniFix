import { Wrench, ClipboardList, ArrowRight } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { StatusBadge, EmptyState, SectionHeader, TabBar } from '../components/SharedComponents'

export default function MaintenanceSection({ items, activeTab, onTabChange, stats, loading, navigate }) {
  const { tokens } = useTheme()

  const tabs = [
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'approved', label: 'Approved', count: stats.approved },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
  ]

  const miniStats = [
    { label: 'Total Staff', value: stats.total ?? 0, color: tokens.text },
    { label: 'Pending Review', value: stats.pending ?? 0, color: tokens.warning },
    { label: 'Approved', value: stats.approved ?? 0, color: tokens.success },
    { label: 'Rejected', value: stats.rejected ?? 0, color: tokens.danger },
  ]

  return (
    <div>
      <SectionHeader title="Maintenance Staff" subtitle="Review and manage maintenance staff verification requests" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {miniStats.map(s => (
          <div key={s.label} style={{
            background: tokens.surface, borderRadius: tokens.radius.xl,
            padding: '16px 20px', border: `1px solid ${tokens.border}`,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: tokens.shadow,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: tokens.radius.lg,
              background: tokens.surfaceLow, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Wrench size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
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
        <EmptyState icon={ClipboardList} text={`No ${activeTab} applications`} sub="Check back later" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(member => (
            <div key={member.id} style={{
              background: tokens.surface, borderRadius: tokens.radius.xl,
              border: `1px solid ${tokens.border}`, overflow: 'hidden',
              boxShadow: tokens.shadow,
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: `1px solid ${tokens.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: tokens.radius.lg,
                  background: tokens.successBg, border: `1.5px solid ${tokens.successBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: tokens.success, flexShrink: 0,
                }}>
                  {member.fullName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>{member.fullName}</div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                </div>
                <StatusBadge verification={member.verificationStatus} />
              </div>

              <div style={{ padding: '12px 16px' }}>
                {[
                  ['Employee ID', member.employeeId],
                  ['Designation', member.designation],
                  ['Experience', member.experience ? `${member.experience} yrs` : null],
                  ['Phone', member.phone],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: `1px solid ${tokens.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 500 }}>{k}</span>
                    <span style={{ fontSize: 12, color: tokens.textSecondary, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 16px' }}>
                <button
                  onClick={() => navigate(`/staff/${member.id}`)}
                  style={{
                    width: '100%', background: tokens.text, color: tokens.surface,
                    border: 'none', borderRadius: tokens.radius.lg, padding: '10px',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontFamily: 'inherit', transition: 'opacity 0.15s',
                  }}
                >
                  View Full Profile <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}