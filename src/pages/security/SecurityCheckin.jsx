import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitorsApi, usersApi } from '@/api'
import { useToastContext } from '@/hooks/ToastContext'
import { checkinSchema } from '@/lib/schemas'
import { FormField, StyledInput, SubmitButton, FieldError } from '@/components/ui/FormComponents'
import { Loader2, UserPlus, Camera, CheckCircle2, Plus, AlertCircle } from 'lucide-react'

export default function SecurityCheckin() {
  const { toast }       = useToastContext()
  const queryClient     = useQueryClient()
  const [createdVisitor, setCreatedVisitor] = useState(null)
  const [photoFile, setPhotoFile]           = useState(null)
  const [photoPreview, setPhotoPreview]     = useState(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkinSchema),
    mode: 'onTouched',
    defaultValues: {
      visitorName:     '',
      mobileNumber:    '',
      purpose:         '',
      numberOfPersons: 1,
      vehicleNumber:   '',
      visitInTime:     new Date().toISOString().slice(0, 16),
      contactPersons:  [],
    },
  })

  const { data: contactPersons, isLoading: loadingContacts } = useQuery({
    queryKey: ['contact-persons'],
    queryFn:  () => usersApi.getContactPersons().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: visitorsApi.create,
    onSuccess: (res) => {
      setCreatedVisitor(res.data)
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] })
      toast({ title: 'Visitor Checked In!', description: `${res.data.visitorNumber} registered.`, variant: 'success' })
    },
    onError: (err) =>
      toast({ title: 'Check-in Failed', description: err.response?.data?.message || 'Please try again.', variant: 'destructive' }),
  })

  const photoMutation = useMutation({
    mutationFn: ({ id, formData }) => visitorsApi.uploadPhoto(id, formData),
    onSuccess: (res) => { setCreatedVisitor(res.data); toast({ title: 'Photo uploaded', variant: 'success' }) },
    onError:   () => toast({ title: 'Upload failed', variant: 'destructive' }),
  })

  const onSubmit = (data) => createMutation.mutate(data)

  const handleReset = () => {
    setCreatedVisitor(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    reset()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)) }
  }

  const handlePhotoUpload = () => {
    if (!photoFile || !createdVisitor) return
    const fd = new FormData()
    fd.append('photo', photoFile)
    photoMutation.mutate({ id: createdVisitor._id, formData: fd })
  }

  // ── Success screen ──────────────────────────────────────────────
  if (createdVisitor) {
    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fadeUp">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(145 55% 38%), hsl(160 55% 32%)', color: 'white' }}>
          <CheckCircle2 size={40} color="rgba(255,255,255,0.9)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '4px' }}>
            Checked In Successfully
          </p>
          <code style={{ fontFamily: 'DM Mono, monospace', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'block', marginBottom: '4px' }}>
            {createdVisitor.visitorNumber}
          </code>
          <p style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.85 }}>{createdVisitor.visitorName}</p>
        </div>

        {/* Photo upload */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid hsl(220 15% 91%)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Camera size={16} style={{ color: 'hsl(230 70% 55%)' }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>Add Photo</p>
            <span style={{ fontSize: '0.72rem', color: 'hsl(220 10% 58%)' }}>(optional)</span>
          </div>

          {(photoPreview || createdVisitor.photo) && (
            <img
              src={photoPreview || createdVisitor.photo}
              alt="Visitor"
              className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4"
              style={{ border: '2px solid hsl(220 15% 91%)' }}
            />
          )}

          <label className="block cursor-pointer">
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
              style={{ borderColor: 'hsl(220 15% 87%)', background: 'hsl(220 20% 98%)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(230 70% 55% / 0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(220 15% 87%)'}
            >
              <Camera size={20} style={{ color: 'hsl(220 10% 65%)', margin: '0 auto 6px' }} />
              <p style={{ fontSize: '0.8rem', color: 'hsl(220 10% 55%)' }}>Click to select a photo</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>

          {photoFile && (
            <button
              onClick={handlePhotoUpload}
              disabled={photoMutation.isPending}
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-3 transition-all"
              style={{
                background: photoMutation.isPending ? 'hsl(230 70% 55% / 0.6)' : 'hsl(230 70% 55%)',
                color: 'white', fontFamily: 'inherit',
                cursor: photoMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {photoMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : 'Upload Photo'}
            </button>
          )}
        </div>

        <button
          onClick={handleReset}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={{ border: '1.5px solid hsl(220 15% 87%)', background: 'white', color: 'hsl(222 25% 20%)', fontFamily: 'inherit' }}
        >
          <Plus size={16} /> Register Another Visitor
        </button>
      </div>
    )
  }

  // ── Check-in form ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fadeUp">
        <p className="page-eyebrow mb-1">Security</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>
          Visitor Check-In
        </h1>
      </div>

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <UserPlus size={16} style={{ color: 'hsl(230 70% 55%)' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>Visitor Information</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visitor Name */}
            <FormField label="Visitor Name" required error={errors.visitorName?.message}>
              <StyledInput
                placeholder="Full name"
                autoFocus
                error={errors.visitorName}
                {...register('visitorName')}
              />
            </FormField>

            {/* Mobile */}
            <FormField label="Mobile Number" required error={errors.mobileNumber?.message}>
              <StyledInput
                placeholder="10-digit number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                error={errors.mobileNumber}
                {...register('mobileNumber')}
              />
            </FormField>

            {/* Purpose */}
            <FormField label="Purpose of Visit" required error={errors.purpose?.message}>
              <StyledInput
                placeholder="Meeting, Interview, Delivery…"
                error={errors.purpose}
                {...register('purpose')}
              />
            </FormField>

            {/* Number of persons */}
            <FormField label="Number of Persons" required error={errors.numberOfPersons?.message}>
              <StyledInput
                type="number"
                min={1}
                max={100}
                error={errors.numberOfPersons}
                {...register('numberOfPersons')}
              />
            </FormField>

            {/* Vehicle */}
            <FormField label="Vehicle Number" error={errors.vehicleNumber?.message} hint="optional">
              <StyledInput
                placeholder="MH12AB1234"
                style={{ textTransform: 'uppercase' }}
                error={errors.vehicleNumber}
                {...register('vehicleNumber')}
              />
            </FormField>

            {/* Visit in time */}
            <FormField label="Check-In Time" required error={errors.visitInTime?.message}>
              <StyledInput
                type="datetime-local"
                error={errors.visitInTime}
                {...register('visitInTime')}
              />
            </FormField>
          </div>

          {/* Contact Persons — Controller for array field */}
          <Controller
            name="contactPersons"
            control={control}
            render={({ field }) => (
              <div className="input-group">
                <label>
                  Contact Persons
                  <span style={{ color: 'hsl(0 72% 58%)', marginLeft: '3px' }}>*</span>
                  <span style={{ fontWeight: 400, color: 'hsl(220 10% 58%)', fontSize: '0.73rem', marginLeft: '4px' }}>
                    — who are they visiting?
                  </span>
                </label>

                {loadingContacts ? (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {[1, 2, 3].map(i => <div key={i} className="shimmer h-9 w-28 rounded-full" />)}
                  </div>
                ) : contactPersons?.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contactPersons.map(cp => {
                      const selected = field.value.includes(cp._id)
                      return (
                        <button
                          type="button"
                          key={cp._id}
                          onClick={() => {
                            const next = selected
                              ? field.value.filter(id => id !== cp._id)
                              : [...field.value, cp._id]
                            field.onChange(next)
                          }}
                          className={`contact-pill ${selected ? 'selected' : ''}`}
                        >
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                            background: selected ? 'rgba(255,255,255,0.7)' : 'hsl(220 15% 70%)',
                          }} />
                          {cp.name}
                          <span style={{ fontSize: '0.68rem', opacity: 0.6, textTransform: 'capitalize' }}>
                            ({cp.role})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-2 p-3 rounded-xl text-sm flex items-center gap-2"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    No managers or HR found. Ask Admin to create them first.
                  </div>
                )}

                <FieldError message={errors.contactPersons?.message} />
              </div>
            )}
          />

          <SubmitButton loading={createMutation.isPending || isSubmitting} loadingText="Checking In…">
            <UserPlus size={16} /> Check In Visitor
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
