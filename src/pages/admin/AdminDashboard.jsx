import { useQuery } from '@tanstack/react-query'
import { visitorsApi } from '@/api'
import { Users, UserCheck, UserX, CalendarDays, Loader2, TrendingUp, ArrowUpRight } from 'lucide-react'

const statCards = [
  { key: 'total',      label: 'Total Visitors',    icon: Users,       color: '#6366f1', bg: '#eef2ff', desc: 'All time' },
  { key: 'checkedIn',  label: 'Inside Now',         icon: UserCheck,   color: '#10b981', bg: '#ecfdf5', desc: 'Currently on premises' },
  { key: 'checkedOut', label: 'Departed',           icon: UserX,       color: '#64748b', bg: '#f1f5f9', desc: 'Completed visits' },
  { key: 'todayCount', label: "Today's Visitors",   icon: CalendarDays,color: '#f59e0b', bg: '#fffbeb', desc: 'Since midnight' },
]

const statusConfig = {
  'checked-in':  { bg: '#dcfce7', color: '#15803d', label: 'Inside' },
  'checked-out': { bg: '#f1f5f9', color: '#475569', label: 'Departed' },
  'pending':     { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
}

function ShimmerRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="shimmer h-4 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['visitor-stats'],
    queryFn: () => visitorsApi.getStats().then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: recentData, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-visitors'],
    queryFn: () => visitorsApi.getAll({ limit: 8 }).then(r => r.data),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">Overview</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>
          Dashboard
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, bg, desc }, i) => (
          <div key={key} className={`stat-card bg-white rounded-2xl p-5 animate-fadeUp stagger-${i + 1}`}
            style={{ border: '1px solid hsl(220 15% 91%)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
              <ArrowUpRight size={14} style={{ color: 'hsl(220 10% 70%)' }} />
            </div>
            {loadingStats ? (
              <div className="shimmer h-8 w-16 rounded mb-1" />
            ) : (
              <p style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'hsl(222 25% 10%)', lineHeight: 1 }}>
                {stats?.[key] ?? '—'}
              </p>
            )}
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(220 10% 35%)', marginTop: '4px' }}>{label}</p>
            <p style={{ fontSize: '0.7rem', color: 'hsl(220 10% 60%)', marginTop: '2px' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Visitors Table */}
      <div className="bg-white rounded-2xl animate-fadeUp stagger-5" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'hsl(230 70% 55%)' }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>Recent Visitors</p>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'hsl(220 10% 58%)', fontWeight: 500 }}>
            {recentData?.total ?? 0} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full vms-table">
            <thead>
              <tr>
                {['Visitor No.', 'Name', 'Mobile', 'Purpose', 'Status', 'In Time'].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingRecent ? (
                [1,2,3].map(i => <ShimmerRow key={i} />)
              ) : recentData?.visitors?.length > 0 ? (
                recentData.visitors.map(v => {
                  const s = statusConfig[v.status] || statusConfig.pending
                  return (
                    <tr key={v._id}>
                      <td>
                        <code style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'hsl(230 70% 50%)', fontWeight: 500 }}>
                          {v.visitorNumber}
                        </code>
                      </td>
                      <td style={{ fontWeight: 500, color: 'hsl(222 25% 12%)', fontSize: '0.85rem' }}>{v.visitorName}</td>
                      <td style={{ color: 'hsl(220 10% 50%)', fontSize: '0.83rem' }}>{v.mobileNumber}</td>
                      <td style={{ color: 'hsl(220 10% 45%)', fontSize: '0.83rem', maxWidth: '140px' }}>
                        <span className="truncate block">{v.purpose}</span>
                      </td>
                      <td>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.78rem' }}>
                        {v.visitInTime ? new Date(v.visitInTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220 10% 65%)', fontSize: '0.85rem' }}>
                    No visitors yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
