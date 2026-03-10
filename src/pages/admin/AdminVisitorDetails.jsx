import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { visitorsApi } from '@/api'
import { Loader2, Search, Eye, Users, X, ChevronLeft, ChevronRight } from 'lucide-react'

const statusConfig = {
  'checked-in':  { bg: '#dcfce7', color: '#15803d', label: 'Inside' },
  'checked-out': { bg: '#f1f5f9', color: '#475569', label: 'Departed' },
  'pending':     { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
}

export default function AdminVisitorDetails() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-visitors', search, statusFilter, page],
    queryFn: () => visitorsApi.getAll({ search, status: statusFilter, page, limit: 10 }).then(r => r.data),
    placeholderData: prev => prev,
  })

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">Administration</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>Visitor Details</h1>
      </div>

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        {/* Filters */}
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220 10% 58%)' }} />
            <input
              placeholder="Search by name, visitor number, mobile..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="vms-input w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid hsl(220 15% 87%)', background: 'hsl(220 20% 98%)', fontFamily: 'inherit', color: 'hsl(222 25% 12%)' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="h-10 px-3.5 rounded-xl text-sm outline-none"
            style={{ border: '1.5px solid hsl(220 15% 87%)', background: 'white', fontFamily: 'inherit', color: 'hsl(222 25% 12%)', minWidth: '140px' }}>
            <option value="">All Status</option>
            <option value="checked-in">Inside</option>
            <option value="checked-out">Departed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <table className="w-full vms-table">
            <thead>
              <tr>
                {['Visitor No.', 'Name', 'Mobile', 'Contact', 'Purpose', '#', 'Vehicle', 'In Time', 'Out Time', 'Duration', 'Status', ''].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(j => (
                      <td key={j}><div className="shimmer h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.visitors?.length > 0 ? data.visitors.map(v => {
                const s = statusConfig[v.status] || statusConfig.pending
                return (
                  <tr key={v._id}>
                    <td><code style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'hsl(230 70% 50%)', fontWeight: 500 }}>{v.visitorNumber}</code></td>
                    <td style={{ fontWeight: 600, fontSize: '0.83rem', color: 'hsl(222 25% 12%)', whiteSpace: 'nowrap' }}>{v.visitorName}</td>
                    <td style={{ color: 'hsl(220 10% 50%)', fontSize: '0.8rem' }}>{v.mobileNumber}</td>
                    <td style={{ color: 'hsl(220 10% 50%)', fontSize: '0.78rem', maxWidth: '100px' }}>
                      <span className="truncate block">{v.contactPersons?.map(cp => cp.name).join(', ') || '—'}</span>
                    </td>
                    <td style={{ color: 'hsl(220 10% 45%)', fontSize: '0.8rem', maxWidth: '110px' }}>
                      <span className="truncate block">{v.purpose}</span>
                    </td>
                    <td style={{ textAlign: 'center', color: 'hsl(222 25% 20%)', fontWeight: 600, fontSize: '0.83rem' }}>{v.numberOfPersons}</td>
                    <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.78rem' }}>{v.vehicleNumber || '—'}</td>
                    <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {v.visitInTime ? new Date(v.visitInTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {v.visitOutTime ? new Date(v.visitOutTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem', color: 'hsl(222 25% 20%)', whiteSpace: 'nowrap' }}>{v.totalTimeSpent || '—'}</td>
                    <td>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(v)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'hsl(230 70% 55%)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(230 70% 55% / 0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '4rem', color: 'hsl(220 10% 60%)' }}>
                    <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.85rem' }}>No visitors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid hsl(220 15% 93%)' }}>
            <p style={{ fontSize: '0.78rem', color: 'hsl(220 10% 55%)' }}>
              Page {page} of {data.totalPages} · {data.total} records
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ border: '1.5px solid hsl(220 15% 88%)', background: 'white', color: page === 1 ? 'hsl(220 10% 70%)' : 'hsl(222 25% 20%)', fontFamily: 'inherit', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ border: '1.5px solid hsl(220 15% 88%)', background: 'white', color: page === data.totalPages ? 'hsl(220 10% 70%)' : 'hsl(222 25% 20%)', fontFamily: 'inherit', cursor: page === data.totalPages ? 'not-allowed' : 'pointer' }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 animate-fadeIn" style={{ background: 'rgba(8,12,28,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col animate-slideRight"
            style={{ borderLeft: '1px solid hsl(220 15% 91%)', boxShadow: '-8px 0 32px hsl(220 20% 20% / 0.1)' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
              <div>
                <p className="page-eyebrow mb-0.5">Visitor</p>
                <code style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, fontSize: '1rem', color: 'hsl(230 70% 50%)' }}>{selected.visitorNumber}</code>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={18} style={{ color: 'hsl(220 10% 50%)' }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.photo && (
                <img src={selected.photo} alt="Visitor" className="w-20 h-20 rounded-2xl object-cover mx-auto" style={{ border: '2px solid hsl(220 15% 91%)' }} />
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Name', selected.visitorName],
                  ['Mobile', selected.mobileNumber],
                  ['Purpose', selected.purpose],
                  ['Persons', selected.numberOfPersons],
                  ['Vehicle', selected.vehicleNumber || '—'],
                  ['Status', selected.status?.replace('-', ' ')],
                  ['In Time', selected.visitInTime ? new Date(selected.visitInTime).toLocaleString('en-IN') : '—'],
                  ['Out Time', selected.visitOutTime ? new Date(selected.visitOutTime).toLocaleString('en-IN') : '—'],
                  ['Duration', selected.totalTimeSpent || '—'],
                  ['Meeting', selected.meetingStatus || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(220 10% 55%)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(222 25% 12%)', textTransform: 'capitalize' }}>{value}</p>
                  </div>
                ))}
              </div>
              {selected.contactPersons?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(220 10% 55%)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Contact Persons</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.contactPersons.map(cp => (
                      <span key={cp._id} style={{ background: 'hsl(230 70% 55% / 0.1)', color: 'hsl(230 70% 45%)', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 500 }}>
                        {cp.name} <span style={{ opacity: 0.6 }}>({cp.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
