import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitorsApi } from '@/api'
import { useToastContext } from '@/hooks/ToastContext'
import { useAuth } from '@/hooks/useAuth'
import { meetingUpdateSchema } from '@/lib/schemas'
import { FormField, StyledTextarea, SubmitButton, FieldError } from '@/components/ui/FormComponents'
import { Loader2, Users, Clock, CheckCircle, X } from 'lucide-react'

const MEETING_STATUSES = [
  { value: 'scheduled',   label: 'Scheduled',   color: '#3b82f6', bg: '#eff6ff' },
  { value: 'in-progress', label: 'In Progress',  color: '#f59e0b', bg: '#fffbeb' },
  { value: 'completed',   label: 'Completed',    color: '#10b981', bg: '#ecfdf5' },
  { value: 'cancelled',   label: 'Cancelled',    color: '#ef4444', bg: '#fef2f2' },
  { value: 'no-show',     label: 'No Show',      color: '#6b7280', bg: '#f3f4f6' },
]

function UpdatePanel({ visitor, onClose }) {
  const { toast }   = useToastContext()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(meetingUpdateSchema),
    mode: 'onTouched',
    defaultValues: {
      meetingStatus: visitor.meetingStatus || '',
      meetingNotes:  visitor.meetingNotes  || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => visitorsApi.updateMeeting(visitor._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-visitors'] })
      toast({ title: 'Meeting updated successfully', variant: 'success' })
      onClose()
    },
    onError: () => toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' }),
  })

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fadeIn"
        style={{ background: 'rgba(8,12,28,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white flex flex-col animate-slideRight"
        style={{ borderLeft: '1px solid hsl(220 15% 91%)', boxShadow: '-8px 0 32px hsl(220 20% 20% / 0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <div>
            <p className="page-eyebrow mb-0.5">Update Meeting</p>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(222 25% 10%)' }}>{visitor.visitorName}</p>
            <p style={{ fontSize: '0.75rem', color: 'hsl(220 10% 55%)', marginTop: '1px' }}>{visitor.purpose}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: 'hsl(220 10% 50%)' }} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} noValidate className="space-y-5">
            {/* Visitor info card */}
            <div className="rounded-xl p-4" style={{ background: 'hsl(220 20% 97%)', border: '1px solid hsl(220 15% 91%)' }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(220 10% 55%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visitor No.</p>
                  <code style={{ fontFamily: 'DM Mono, monospace', color: 'hsl(230 70% 50%)', fontWeight: 600, fontSize: '0.85rem' }}>{visitor.visitorNumber}</code>
                </div>
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(220 10% 55%)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Persons</p>
                  <p style={{ color: 'hsl(222 25% 20%)', fontWeight: 600, fontSize: '0.85rem' }}>{visitor.numberOfPersons}</p>
                </div>
              </div>
            </div>

            {/* Meeting Status — Controller with visual radio buttons */}
            <Controller
              name="meetingStatus"
              control={control}
              render={({ field }) => (
                <div className="input-group">
                  <label>
                    Meeting Status
                    <span style={{ color: 'hsl(0 72% 58%)', marginLeft: '3px' }}>*</span>
                  </label>
                  <div className="space-y-2 mt-1">
                    {MEETING_STATUSES.map((s) => {
                      const isSelected = field.value === s.value
                      return (
                        <button
                          type="button"
                          key={s.value}
                          onClick={() => field.onChange(s.value)}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all"
                          style={{
                            border:      `1.5px solid ${isSelected ? s.color : 'hsl(220 15% 88%)'}`,
                            background:   isSelected ? s.bg : 'white',
                            boxShadow:    isSelected ? `0 2px 8px ${s.color}25` : 'none',
                            fontFamily:  'inherit',
                          }}
                        >
                          {/* Custom radio dot */}
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${isSelected ? s.color : 'hsl(220 15% 75%)'}`,
                            background: isSelected ? s.color : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}>
                            {isSelected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? s.color : 'hsl(222 25% 30%)',
                            transition: 'all 0.15s',
                          }}>
                            {s.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <FieldError message={errors.meetingStatus?.message} />
                </div>
              )}
            />

            {/* Meeting Notes */}
            <FormField
              label="Meeting Notes"
              hint="optional, max 500 chars"
              error={errors.meetingNotes?.message}
            >
              <StyledTextarea
                placeholder="Add any notes about the meeting…"
                rows={3}
                error={errors.meetingNotes}
                {...register('meetingNotes')}
              />
            </FormField>

            <SubmitButton
              loading={updateMutation.isPending || isSubmitting}
              loadingText="Saving…"
            >
              Save Meeting Status
            </SubmitButton>
          </form>
        </div>
      </div>
    </>
  )
}

export default function ManagerVisitorForm() {
  const { user }            = useAuth()
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-visitors', user?.id],
    queryFn:  () => visitorsApi.getAll({ status: 'checked-in', limit: 50 }).then(r => r.data),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">Your Desk</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>
          Active Visitors
        </h1>
      </div>

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <Users size={15} style={{ color: 'hsl(230 70% 55%)' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)', flex: 1 }}>
            Visitors assigned to you
          </p>
          {data?.visitors?.length > 0 && (
            <span style={{ background: 'hsl(230 70% 55%)', color: 'white', padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600 }}>
              {data.visitors.length}
            </span>
          )}
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="shimmer h-[76px] rounded-2xl" />)}</div>
          ) : data?.visitors?.length > 0 ? (
            <div className="space-y-3">
              {data.visitors.map((v, idx) => {
                const status = MEETING_STATUSES.find(s => s.value === v.meetingStatus)
                const mins   = v.visitInTime ? Math.floor((Date.now() - new Date(v.visitInTime)) / 60000) : 0
                const h = Math.floor(mins / 60), m = mins % 60

                return (
                  <div
                    key={v._id}
                    className="visitor-card flex items-center gap-4 p-4 animate-fadeUp"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {v.photo
                      ? <img src={v.photo} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" style={{ border: '1.5px solid hsl(220 15% 91%)' }} />
                      : <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                          style={{ background: 'hsl(230 70% 55% / 0.1)', color: 'hsl(230 70% 50%)' }}>
                          {v.visitorName?.[0]?.toUpperCase()}
                        </div>}

                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'hsl(222 25% 12%)' }}>{v.visitorName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(220 10% 55%)', marginTop: '1px' }}>
                        {v.purpose} · {v.numberOfPersons} person{v.numberOfPersons > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1 justify-end" style={{ color: '#f59e0b' }}>
                          <Clock size={11} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{h > 0 ? `${h}h ` : ''}{m}m</span>
                        </div>
                        {status && (
                          <span style={{ background: status.bg, color: status.color, padding: '2px 8px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600 }}>
                            {status.label}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelected(v)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: 'hsl(230 70% 55% / 0.09)', color: 'hsl(230 70% 50%)', fontFamily: 'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(230 70% 55% / 0.16)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'hsl(230 70% 55% / 0.09)'}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 10px', color: 'hsl(220 15% 82%)' }} />
              <p style={{ fontSize: '0.85rem', color: 'hsl(220 10% 60%)', fontWeight: 500 }}>
                No active visitors assigned to you
              </p>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <UpdatePanel
          visitor={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
