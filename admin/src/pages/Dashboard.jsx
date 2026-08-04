import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminAPI } from '../services/api'
import logo from '../icon.png'
import {
  LayoutDashboard, ClipboardList, Wrench, Users,
  CreditCard, Trash2, ShieldAlert, LogOut, AlertCircle,
  Menu, Clock, Database, RefreshCw, Flag, X, Search,
  Package,
} from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { ThemeToggle } from '../components/SharedComponents'
import OverviewSection from './OverviewSection'
import { ComplaintsSection } from './ComplaintsSection'
import MaintenanceSection from './MaintenanceSection'
import StaffUsersSection from './StaffUsersSection'
import IdCardsSection from './IdCardsSection'
import DeletionsSection from './DeletionsSection'
import SecuritySection from './SecuritySection'
import HistorySection from './HistorySection'
import FlaggedSection from './FlaggedSection'
import MasterDataSection from './MasterDataSection'
import AnalyticsSection from './AnalyticsSection'
import LostFoundSection from './LostFoundSection'

export default function Dashboard() {
  const navigate = useNavigate()
  const { section = 'overview' } = useParams()
  const { tokens, mode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState([])
  const [complaints, setComplaints] = useState([])
  const [users, setUsers] = useState([])
  const [lostFoundItems, setLostFoundItems] = useState([])
  const [lostReports, setLostReports] = useState([])
  const [stats, setStats] = useState({
    pending: 0, approved: 0, rejected: 0, total: 0,
    students: 0, teachers: 0, complaints: {},
    pendingIdCardRequests: 0, pendingDeletionRequests: 0, openSecurityIssues: 0,
  })
  const [staffTab, setStaffTab] = useState('pending')
  const [complaintTab, setComplaintTab] = useState('all')
  const [userTab, setUserTab] = useState('student')
  const [lfTab, setLfTab] = useState('found_items')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeComplaint, setActiveComplaint] = useState(null)
  const [error, setError] = useState('')
  const [idCardRequests, setIdCardRequests] = useState([])
  const [deletionRequests, setDeletionRequests] = useState({ staffRequests: [], userDeletions: [] })
  const [securityIssues, setSecurityIssues] = useState([])
  const [masterData, setMasterData] = useState(null)
  const [masterLoading, setMasterLoading] = useState(false)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleNavClick = useCallback((key) => {
    navigate(`/${key}`)
    setSidebarOpen(false)
  }, [navigate])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [staffRes, statsRes, complaintsRes, usersRes] = await Promise.all([
        adminAPI.getAllStaff(),
        adminAPI.getStats(),
        adminAPI.getAllComplaints(),
        adminAPI.getAllUsers(),
      ])
      setStaff(staffRes.data.staff ?? [])
      setStats(statsRes.data.stats ?? {})
      setComplaints(complaintsRes.data.complaints ?? [])
      setUsers(usersRes.data.users ?? [])
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('unifix_admin_token')
        navigate('/login')
      } else {
        setError('Failed to load dashboard data.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const fetchIdCardRequests = useCallback(async () => {
    try {
      const r = await adminAPI.getIdCardRequests()
      setIdCardRequests(r.data.requests ?? [])
    } catch {}
  }, [])

  const fetchDeletionRequests = useCallback(async () => {
    try {
      const r = await adminAPI.getDeletionRequests()
      setDeletionRequests(r.data ?? { staffRequests: [], userDeletions: [] })
    } catch {}
  }, [])

  const fetchSecurityIssues = useCallback(async () => {
    try {
      const r = await adminAPI.getSecurityIssues()
      setSecurityIssues(r.data.issues ?? [])
    } catch {}
  }, [])

  const fetchMasterData = useCallback(async () => {
    setMasterLoading(true)
    try {
      const r = await adminAPI.getMasterDataAdmin()
      setMasterData(r.data)
    } catch {}
    finally { setMasterLoading(false) }
  }, [])

  const fetchLostFound = useCallback(async () => {
    try {
      const [itemsRes, reportsRes] = await Promise.all([
        adminAPI.getLostFoundItems ? adminAPI.getLostFoundItems() : Promise.resolve({ data: { items: [] } }),
        adminAPI.getLostReports ? adminAPI.getLostReports() : Promise.resolve({ data: { reports: [] } }),
      ])
      setLostFoundItems(itemsRes.data.items ?? [])
      setLostReports(reportsRes.data.reports ?? [])
    } catch {}
  }, [])

  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      if (section === 'overview') await fetchAll()
      else if (section === 'complaints') { const r = await adminAPI.getAllComplaints(); setComplaints(r.data.complaints ?? []) }
      else if (section === 'staff') { const r = await adminAPI.getAllStaff(); setStaff(r.data.staff ?? []) }
      else if (section === 'users') { const r = await adminAPI.getAllUsers(); setUsers(r.data.users ?? []) }
      else if (section === 'idcards') await fetchIdCardRequests()
      else if (section === 'deletions') await fetchDeletionRequests()
      else if (section === 'security') await fetchSecurityIssues()
      else if (section === 'flagged') await fetchAll()
      else if (section === 'history') { const r = await adminAPI.getAllComplaints(); setComplaints(r.data.complaints ?? []) }
      else if (section === 'master') await fetchMasterData()
      else if (section === 'lostfound') await fetchLostFound()
    } catch {}
    finally { setRefreshing(false) }
  }, [refreshing, section, fetchAll, fetchIdCardRequests, fetchDeletionRequests, fetchSecurityIssues, fetchMasterData, fetchLostFound])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (section === 'idcards') fetchIdCardRequests()
    if (section === 'deletions') fetchDeletionRequests()
    if (section === 'security') fetchSecurityIssues()
    if (section === 'master') fetchMasterData()
    if (section === 'lostfound') fetchLostFound()
  }, [section, fetchIdCardRequests, fetchDeletionRequests, fetchSecurityIssues, fetchMasterData, fetchLostFound])

  const logout = useCallback(() => {
    localStorage.removeItem('unifix_admin_token')
    navigate('/login')
  }, [navigate])

  const cs = stats.complaints ?? {}
  const visibleStaff = useMemo(() => staff.filter(m => m.verificationStatus === staffTab), [staff, staffTab])
  const visibleComplaints = useMemo(() =>
    complaintTab === 'all' ? complaints :
    complaintTab === 'flagged' ? complaints.filter(c => c.flagged && !c.flagResolved && ['pending','assigned','in_progress'].includes(c.status)) :
    complaints.filter(c => c.status === complaintTab),
    [complaints, complaintTab]
  )
  const visibleUsers = useMemo(() => users.filter(u => u.role === userTab), [users, userTab])
  const flaggedCount = complaints.filter(c => c.flagged && !c.flagResolved && ['pending','assigned','in_progress'].includes(c.status)).length

  const lfAvailable = lostFoundItems.filter(i => i.status === 'available').length
  const lfHandedOver = lostFoundItems.filter(i => i.status === 'handed_over').length
  const lrActive = lostReports.filter(r => r.status !== 'found').length
  const lrFound = lostReports.filter(r => r.status === 'found').length

  const visibleLF = useMemo(() => {
    if (lfTab === 'found_items') return lostFoundItems
    if (lfTab === 'available') return lostFoundItems.filter(i => i.status === 'available')
    if (lfTab === 'handed_over') return lostFoundItems.filter(i => i.status === 'handed_over')
    if (lfTab === 'lost_reports') return lostReports
    if (lfTab === 'lost_active') return lostReports.filter(r => r.status !== 'found')
    if (lfTab === 'lost_found') return lostReports.filter(r => r.status === 'found')
    return lostFoundItems
  }, [lfTab, lostFoundItems, lostReports])

  const NAV_SECTIONS = [
    {
      label: 'Main',
      items: [
        { key: 'overview', Icon: LayoutDashboard, label: 'Dashboard' },
        { key: 'flagged', Icon: Flag, label: 'Flagged', badge: flaggedCount },
        { key: 'complaints', Icon: ClipboardList, label: 'Complaints', badge: cs.pending },
        { key: 'history', Icon: Clock, label: 'History' },
        { key: 'analytics', Icon: LayoutDashboard, label: 'Analytics' },
      ],
    },
    {
      label: 'Management',
      items: [
        { key: 'staff', Icon: Wrench, label: 'Maintenance', badge: stats.pending },
        { key: 'users', Icon: Users, label: 'Staff & Users' },
        { key: 'lostfound', Icon: Package, label: 'Lost & Found' },
      ],
    },
    {
      label: 'Admin Actions',
      items: [
        { key: 'idcards', Icon: CreditCard, label: 'ID Cards', badge: stats.pendingIdCardRequests },
        { key: 'deletions', Icon: Trash2, label: 'Deletions', badge: stats.pendingDeletionRequests },
        { key: 'security', Icon: ShieldAlert, label: 'Security', badge: stats.openSecurityIssues },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { key: 'master', Icon: Database, label: 'Master Data' },
      ],
    },
  ]

  const sectionLabel = NAV_SECTIONS.flatMap(s => s.items).find(i => i.key === section)?.label ?? 'Dashboard'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed', inset: 0, background: tokens.modalOverlay,
            zIndex: 19, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside style={{
        width: 220, flexShrink: 0, background: tokens.sidebar,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}
        className="sidebar-desktop"
      >
        <div style={{
          padding: '18px 16px', borderBottom: `1px solid ${tokens.sidebarBorder}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img src={logo} alt="UniFiX" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: tokens.text, letterSpacing: '-0.02em' }}>UniFiX</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: tokens.success, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_SECTIONS.map(sec => (
            <div key={sec.label}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: tokens.sidebarLabel,
                letterSpacing: '1.2px', textTransform: 'uppercase',
                padding: '10px 8px 5px',
              }}>
                {sec.label}
              </div>
              {sec.items.map(({ key, Icon, label, badge }) => {
                const isActive = section === key
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 10px', borderRadius: 8, border: 'none',
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.15s', position: 'relative',
                      background: isActive ? tokens.sidebarActive : 'transparent',
                      color: isActive ? tokens.sidebarTextActive : tokens.sidebarText,
                      fontFamily: 'inherit',
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute', left: 0, top: 6, bottom: 6,
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: tokens.primary,
                      }} />
                    )}
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 7px',
                        borderRadius: tokens.radius.pill, flexShrink: 0,
                        background: isActive ? tokens.primary : tokens.warning,
                        color: '#fff',
                      }}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '10px 8px 16px', borderTop: `1px solid ${tokens.sidebarBorder}` }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: 'rgba(248,81,73,0.1)', color: '#f85149',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              width: '100%', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        className="main-content">
        <header style={{
          height: 56, background: tokens.headerBg,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 10,
          borderBottom: `1px solid ${tokens.headerBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="menu-btn-mobile"
              style={{
                display: 'none', width: 34, height: 34, borderRadius: 8,
                border: `1.5px solid ${tokens.border}`,
                background: tokens.surfaceHigh, color: tokens.textSecondary,
                cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={16} />
            </button>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, letterSpacing: '-0.01em' }}>{sectionLabel}</div>
              <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 1 }}>UniFiX Admin</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: `1.5px solid ${tokens.border}`, borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                background: tokens.surface, color: tokens.textSecondary,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.6 : 1, fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflowAuto: 'auto' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: tokens.dangerBg, color: tokens.danger,
              border: `1px solid ${tokens.dangerBorder}`,
              borderRadius: 10, padding: '12px 16px',
              fontSize: 13, fontWeight: 600, marginBottom: 20,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {section === 'overview' && <OverviewSection stats={stats} cs={cs} complaints={complaints} onNavigate={(key) => navigate(`/${key}`)} loading={loading} />}
          {section === 'complaints' && <ComplaintsSection allComplaints={complaints} visible={visibleComplaints} activeTab={complaintTab} onTabChange={setComplaintTab} cs={cs} loading={loading} focused={activeComplaint} setFocused={setActiveComplaint} />}
          {section === 'staff' && <MaintenanceSection items={visibleStaff} activeTab={staffTab} onTabChange={setStaffTab} stats={stats} loading={loading} navigate={navigate} />}
          {section === 'users' && <StaffUsersSection items={visibleUsers} activeTab={userTab} onTabChange={setUserTab} stats={stats} loading={loading} />}
          {section === 'idcards' && <IdCardsSection requests={idCardRequests} loading={loading} onRefresh={fetchIdCardRequests} />}
          {section === 'deletions' && <DeletionsSection data={deletionRequests} loading={loading} onRefresh={fetchDeletionRequests} />}
          {section === 'security' && <SecuritySection issues={securityIssues} loading={loading} onRefresh={fetchSecurityIssues} />}
          {section === 'flagged' && <FlaggedSection allComplaints={complaints} loading={loading} onRefresh={fetchAll} />}
          {section === 'history' && <HistorySection allComplaints={complaints} loading={loading} />}
          {section === 'analytics' && <AnalyticsSection complaints={complaints} loading={loading} />}
          {section === 'master' && <MasterDataSection data={masterData} loading={masterLoading} onRefresh={fetchMasterData} />}
          {section === 'lostfound' && (
            <LostFoundSection
              items={visibleLF}
              allItems={lostFoundItems}
              lostReports={lostReports}
              activeTab={lfTab}
              onTabChange={setLfTab}
              available={lfAvailable}
              handedOver={lfHandedOver}
              lrActive={lrActive}
              lrFound={lrFound}
              loading={loading}
            />
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
          .main-content { margin-left: 0 !important; }
          .menu-btn-mobile { display: flex !important; }
          main { padding: 16px !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}