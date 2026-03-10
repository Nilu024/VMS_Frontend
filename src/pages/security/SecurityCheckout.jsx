import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitorsApi } from '@/api'
import { useToastContext } from '@/hooks/ToastContext'
import { checkoutSchema } from '@/lib/schemas'
import { FormField, StyledInput } from '@/components/ui/FormComponents'
import { Loader2, LogOut, Search, Clock, CheckCircle2, Users, X, Calendar } from 'lucide-react'

function CheckoutModal({ visitor, onClose, onSuccess }) {
  const { toast }   = useToastContext()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { visitOutTime: new Date().toISOString().slice(0, 16) },
  })

  const checkoutMutation = useMutation({
    mutationFn: (data) => visitorsApi.checkout(visitor._id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['checkedin-visitors'] })
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] })
      toast({ title: 'Checked Out', description: `${res.data.visitorName} · ${res.data.totalTimeSpent}`, variant: 'success' })
      onSuccess(res.data)
    },
    onError: () => toast({ title: 'Checkout failed', variant: 'destructive' }),
  })

  return (
    <>
      <div className="fixed inset-0 z-40 animate-fadeIn"
        style={{ background: 'rgba(8,12,28,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl w-full max-w-sm animate-scaleIn"
          style={{ border: '1px solid hsl(220 15% 91%)', boxShadow: '0 20px 60px hsl(220 20% 10% / 0.2)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
            <div>
              <p className="page-eyebrow mb-0.5">Confirm Check-Out</p>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(222 25% 10%)' }}>{visitor.visitorName}</p>
              <code style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'hsl(230 70% 50%)' }}>
                {visitor.visitorNumber}
              </code>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X size={18} style={{ color: 'hsl(220 10% 50%)' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit(d => checkoutMutation.mutate(d))} noValidate className="p-5 space-y-4">
            <FormField label="Check-Out Date & Time" required error={errors.visitOutTime?.message}>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'hsl(220 10% 55%)', pointerEvents: 'none' }} />
                <StyledInput
                  type="datetime-local"
                  error={errors.visitOutTime}
                  style={{ paddingLeft: '2.25rem' }}
                  {...register('visitOutTime')}
                />
              </div>
            </FormField>

            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'hsl(220 20% 97%)', border: '1px solid hsl(220 15% 91%)' }}>
              <Clock size={13} style={{ color: 'hsl(220 10% 55%)', flexShrink: 0 }} />
              <span style={{ color: 'hsl(220 10% 50%)', fontSize: '0.78rem' }}>
                Checked in:{' '}
                <strong style={{ color: 'hsl(222 25% 20%)' }}>
                  {visitor.visitInTime
                    ? new Date(visitor.visitInTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </strong>
              </span>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 rounded-xl text-sm font-semibold"
                style={{ border: '1.5px solid hsl(220 15% 88%)', background: 'white', color: 'hsl(220 10% 40%)', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit"
                disabled={checkoutMutation.isPending || isSubmitting}
                className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: checkoutMutation.isPending ? 'hsl(0 72% 58% / 0.5)' : 'hsl(0 72% 58%)',
                  color: 'white', fontFamily: 'inherit',
                  cursor: checkoutMutation.isPending ? 'not-allowed' : 'pointer',
                  boxShadow: checkoutMutation.isPending ? 'none' : '0 3px 10px hsl(0 72% 58% / 0.25)',
                }}>
                {checkoutMutation.isPending
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : <><LogOut size={13} /> Confirm Check-Out</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default function SecurityCheckout() {
  const [search, setSearch]     = useState('')
  const [lastOut, setLastOut]   = useState(null)
  const [checking, setChecking] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['checkedin-visitors', search],
    queryFn:  () => visitorsApi.getAll({ status: 'checked-in', search, limit: 30 }).then(r => r.data),
    refetchInterval: 20000,
  })

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">Security</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>Check-Out</h1>
      </div>

      {lastOut && (
        <div className="flex items-center gap-4 p-4 rounded-2xl animate-scaleIn"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white' }}>
          <CheckCircle2 size={22} style={{ flexShrink: 0, opacity: 0.9 }} />
          <div className="flex-1">
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lastOut.visitorName} checked out</p>
            <p style={{ fontSize: '0.78rem', opacity: 0.75 }}>{lastOut.visitorNumber} · Total time: {lastOut.totalTimeSpent}</p>
          </div>
          <button onClick={() => setLastOut(null)} style={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
        </div>
      )}

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <div className="flex items-center gap-2 flex-1">
            <Users size={15} style={{ color: 'hsl(230 70% 55%)' }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>
              Active Visitors
              {data?.total > 0 && (
                <span style={{ marginLeft: '8px', background: 'hsl(230 70% 55%)', color: 'white', padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600 }}>
                  {data.total}
                </span>
              )}
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220 10% 58%)' }} />
            <input
              placeholder="Search visitor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="vms-input h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid hsl(220 15% 87%)', background: 'hsl(220 20% 98%)', fontFamily: 'inherit', color: 'hsl(222 25% 12%)', width: '200px' }}
            />
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}</div>
          ) : data?.visitors?.length > 0 ? (
            <div className="space-y-3">
              {data.visitors.map((v, idx) => {
                const mins = v.visitInTime ? Math.floor((Date.now() - new Date(v.visitInTime)) / 60000) : 0
                const h = Math.floor(mins / 60), m = mins % 60
                return (
                  <div key={v._id} className="visitor-card flex items-center gap-4 p-4 animate-fadeUp"
                    style={{ animationDelay: `${idx * 40}ms` }}>
                    {v.photo
                      ? <img src={v.photo} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" style={{ border: '1.5px solid hsl(220 15% 91%)' }} />
                      : <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                          style={{ background: 'hsl(230 70% 55% / 0.1)', color: 'hsl(230 70% 50%)' }}>
                          {v.visitorName?.[0]?.toUpperCase()}
                        </div>}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'hsl(222 25% 12%)' }}>{v.visitorName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(220 10% 55%)', marginTop: '1px' }}>
                        <code style={{ fontFamily: 'DM Mono, monospace', color: 'hsl(230 70% 50%)' }}>{v.visitorNumber}</code>
                        {' · '}{v.purpose}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block flex-shrink-0">
                      <div className="flex items-center gap-1.5 justify-end" style={{ color: '#f59e0b' }}>
                        <Clock size={12} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{h > 0 ? `${h}h ` : ''}{m}m</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'hsl(220 10% 60%)', marginTop: '1px' }}>
                        In: {new Date(v.visitInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => setChecking(v)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
                      style={{ background: 'hsl(0 72% 58%)', color: 'white', fontFamily: 'inherit', boxShadow: '0 3px 10px hsl(0 72% 58% / 0.25)' }}>
                      <LogOut size={13} /> Check Out
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px', color: 'hsl(220 15% 82%)' }} />
              <p style={{ fontSize: '0.85rem', color: 'hsl(220 10% 60%)', fontWeight: 500 }}>
                No active visitors{search ? ' found' : ' right now'}
              </p>
            </div>
          )}
        </div>
      </div>

      {checking && (
        <CheckoutModal
          visitor={checking}
          onClose={() => setChecking(null)}
          onSuccess={(data) => { setLastOut(data); setChecking(null) }}
        />
      )}
    </div>
  )
}
