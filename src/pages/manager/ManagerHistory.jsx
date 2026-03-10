import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { visitorsApi } from '@/api'
import { Loader2, Search, History, Clock } from 'lucide-react'

const MEETING_STATUS_CONFIG = {
  'scheduled':   { color: '#3b82f6', bg: '#eff6ff', label: 'Scheduled'   },
  'in-progress': { color: '#f59e0b', bg: '#fffbeb', label: 'In Progress'  },
  'completed':   { color: '#10b981', bg: '#ecfdf5', label: 'Completed'    },
  'cancelled':   { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled'    },
  'no-show':     { color: '#6b7280', bg: '#f3f4f6', label: 'No Show'      },
}

export default function ManagerHistory() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-visitor-history', search],
    queryFn:  () => visitorsApi.getAll({ status: 'checked-out', search, limit: 50 }).then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">History</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>
          Visitor History
        </h1>
      </div>

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <History size={15} style={{ color: 'hsl(230 70% 55%)' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)', flex: 1 }}>Past Visitors</p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220 10% 58%)' }} />
            <input
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="vms-input h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid hsl(220 15% 87%)', background: 'hsl(220 20% 98%)', fontFamily: 'inherit', color: 'hsl(222 25% 12%)', width: '180px' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} style={{ color: 'hsl(230 70% 55%)' }} className="animate-spin" />
          </div>
        ) : data?.visitors?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full vms-table">
              <thead>
                <tr>
                  {['Visitor No.', 'Name', 'Purpose', 'In Time', 'Out Time', 'Duration', 'Meeting', 'Notes'].map(h => (
                    <th key={h} className="text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.visitors.map(v => {
                  const ms = MEETING_STATUS_CONFIG[v.meetingStatus]
                  return (
                    <tr key={v._id}>
                      <td>
                        <code style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'hsl(230 70% 50%)', fontWeight: 500 }}>
                          {v.visitorNumber}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.83rem', color: 'hsl(222 25% 12%)', whiteSpace: 'nowrap' }}>
                        {v.visitorName}
                      </td>
                      <td style={{ color: 'hsl(220 10% 50%)', fontSize: '0.8rem', maxWidth: '120px' }}>
                        <span className="truncate block">{v.purpose}</span>
                      </td>
                      <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {v.visitInTime
                          ? new Date(v.visitInTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {v.visitOutTime
                          ? new Date(v.visitOutTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td>
                        {v.totalTimeSpent ? (
                          <div className="flex items-center gap-1" style={{ color: 'hsl(222 25% 25%)', fontWeight: 600, fontSize: '0.8rem' }}>
                            <Clock size={11} style={{ color: 'hsl(220 10% 55%)' }} />
                            {v.totalTimeSpent}
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {ms
                          ? <span style={{ background: ms.bg, color: ms.color, padding: '3px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{ms.label}</span>
                          : <span style={{ color: 'hsl(220 10% 65%)', fontSize: '0.8rem' }}>—</span>}
                      </td>
                      <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.78rem', maxWidth: '130px' }}>
                        <span className="truncate block">{v.meetingNotes || '—'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <History size={36} style={{ margin: '0 auto 10px', color: 'hsl(220 15% 82%)' }} />
            <p style={{ fontSize: '0.85rem', color: 'hsl(220 10% 60%)', fontWeight: 500 }}>No visitor history yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
