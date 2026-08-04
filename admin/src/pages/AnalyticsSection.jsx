import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { TrendingUp, Clock, AlertTriangle, Award, Activity } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { SectionHeader } from '../components/SharedComponents'
import { CATEGORY } from '../constants'

const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a'
  if (i < 12) return `${i}a`
  if (i === 12) return '12p'
  return `${i - 12}p`
})

function toMs(ts) {
  if (!ts) return null
  if (ts.toDate) return ts.toDate().getTime()
  if (ts._seconds) return ts._seconds * 1000
  return new Date(ts).getTime()
}

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function AnalyticsSection({ complaints, loading }) {
  const { tokens } = useTheme()

  const categoryData = useMemo(() => {
    const counts = {}
    complaints.forEach(c => {
      const key = c.category || 'others'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: CATEGORY[key]?.color || CATEGORY.others.color,
      }))
      .sort((a, b) => b.value - a.value)
  }, [complaints])

  const avgResolutionTime = useMemo(() => {
    const resolved = complaints.filter(c => c.status === 'completed' && c.acceptedAt && c.completedAt)
    if (!resolved.length) return 'N/A'
    const total = resolved.reduce((sum, c) => {
      const start = toMs(c.acceptedAt)
      const end = toMs(c.completedAt)
      return sum + (end - start)
    }, 0)
    const avgMs = total / resolved.length
    const hours = Math.floor(avgMs / 3600000)
    const mins = Math.floor((avgMs % 3600000) / 60000)
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }, [complaints])

  const escalationRate = useMemo(() => {
    if (!complaints.length) return '0%'
    const flagged = complaints.filter(c => c.flagged === true).length
    return `${Math.round((flagged / complaints.length) * 100)}%`
  }, [complaints])

  const staffPerformance = useMemo(() => {
    const map = {}
    complaints.forEach(c => {
      if (!c.assignedToName) return
      if (!map[c.assignedToName]) map[c.assignedToName] = { name: c.assignedToName, resolved: 0, total: 0, totalMs: 0 }
      map[c.assignedToName].total++
      if (c.status === 'completed') {
        map[c.assignedToName].resolved++
        if (c.acceptedAt && c.completedAt) {
          const ms = toMs(c.completedAt) - toMs(c.acceptedAt)
          if (ms > 0) map[c.assignedToName].totalMs += ms
        }
      }
    })
    return Object.values(map)
      .map(s => ({
        ...s,
        rate: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0,
        avgTime: s.resolved > 0 ? Math.round(s.totalMs / s.resolved / 3600000) : 0,
      }))
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 8)
  }, [complaints])

  const peakHours = useMemo(() => {
    const counts = Array(24).fill(0)
    complaints.forEach(c => {
      const ms = toMs(c.createdAt)
      if (!ms) return
      counts[new Date(ms).getHours()]++
    })
    return counts.map((count, i) => ({ hour: HOURS[i], count }))
  }, [complaints])

  const monthlyTrend = useMemo(() => {
    const map = {}
    complaints.forEach(c => {
      const ms = toMs(c.createdAt)
      if (!ms) return
      const d = new Date(ms)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { month: key, submitted: 0, resolved: 0 }
      map[key].submitted++
      if (c.status === 'completed') map[key].resolved++
    })
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(m => ({ ...m, month: new Date(m.month + '-01').toLocaleString('en', { month: 'short', year: '2-digit' }) }))
  }, [complaints])

  const peakHour = useMemo(() => {
    const max = peakHours.reduce((a, b) => b.count > a.count ? b : a, { count: 0 })
    return max.count > 0 ? max.hour : 'N/A'
  }, [peakHours])

  const panelStyle = {
    background: tokens.surface, border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radius.xxl, padding: 20, boxShadow: tokens.shadow,
  }

  const tooltipStyle = {
    contentStyle: {
      background: tokens.surface, border: `1px solid ${tokens.border}`,
      borderRadius: 8, fontSize: 12, color: tokens.text, boxShadow: tokens.shadowMd,
    },
  }

  const statCards = [
    { icon: Activity, label: 'Total Complaints', value: complaints.length, sub: 'All time', color: tokens.purple },
    { icon: Clock, label: 'Avg Resolution', value: avgResolutionTime, sub: 'Accepted → Completed', color: tokens.info },
    { icon: AlertTriangle, label: 'Escalation Rate', value: escalationRate, sub: 'Flagged complaints', color: tokens.danger },
    { icon: TrendingUp, label: 'Peak Hour', value: peakHour, sub: 'Most complaints submitted', color: tokens.warning },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: tokens.textMuted, fontSize: 14 }}>
      Loading analytics…
    </div>
  )

  return (
    <div>
      <SectionHeader title="Analytics" subtitle="Performance insights and complaint trends across campus." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ ...panelStyle, padding: '18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: tokens.radius.lg, background: card.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={16} color={card.color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: tokens.text, letterSpacing: '-0.04em', marginBottom: 5 }}>{card.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tokens.textMuted }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Complaints by Category</div>
          <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 16 }}>Distribution across all complaint types</div>
          {categoryData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: tokens.textMuted, fontSize: 13 }}>No data</div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={CustomPieLabel}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {categoryData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: tokens.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tokens.text }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Monthly Trend</div>
          <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 16 }}>Submitted vs resolved over last 6 months</div>
          {monthlyTrend.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: tokens.textMuted, fontSize: 13 }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tokens.chartGrid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tokens.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: tokens.textMuted }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="submitted" stroke={tokens.primary} strokeWidth={2} dot={{ r: 3 }} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke={tokens.success} strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>Peak Complaint Hours</div>
        <div style={{ fontSize: 11, color: tokens.textMuted, marginBottom: 16 }}>Number of complaints submitted by hour of day</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tokens.chartGrid} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: tokens.textMuted }} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: tokens.textMuted }} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill={tokens.primary} radius={[4, 4, 0, 0]} name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `1px solid ${tokens.border}` }}>
          <Award size={16} color={tokens.warning} />
          <span style={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>Staff Performance</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: tokens.tableHeadBg }}>
                {['Rank', 'Staff Name', 'Assigned', 'Resolved', 'Success Rate', 'Avg Time'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: tokens.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${tokens.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffPerformance.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: tokens.textMuted, fontSize: 14 }}>No staff data</td></tr>
              ) : staffPerformance.map((s, i) => (
                <tr key={s.name}
                  onMouseEnter={e => e.currentTarget.style.background = tokens.tableRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: i === 0 ? tokens.warningBg : tokens.surfaceHigh, color: i === 0 ? tokens.warning : tokens.textMuted }}>
                      {i + 1}
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 13, fontWeight: 600, color: tokens.text }}>{s.name}</td>
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 13, color: tokens.textSecondary }}>{s.total}</td>
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 13, color: tokens.textSecondary }}>{s.resolved}</td>
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, maxWidth: 80, height: 6, borderRadius: 3, background: tokens.surfaceHigh, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: `${s.rate}%`, background: s.rate >= 80 ? tokens.success : s.rate >= 50 ? tokens.warning : tokens.danger }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.rate >= 80 ? tokens.success : s.rate >= 50 ? tokens.warning : tokens.danger }}>{s.rate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', borderBottom: `1px solid ${tokens.border}`, fontSize: 12, color: tokens.textMuted }}>{s.avgTime > 0 ? `${s.avgTime}h` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}