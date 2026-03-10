import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitorsApi } from '@/api'
import { useToastContext } from '@/hooks/ToastContext'
import { reportSchema } from '@/lib/schemas'
import { FormField, StyledInput, SubmitButton } from '@/components/ui/FormComponents'
import { Download, FileText, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const REPORT_FIELDS = [
  'Visitor Number', 'Name & Mobile', 'Purpose',
  'No. of Persons', 'Vehicle Number', 'Check-In Time',
  'Check-Out Time', 'Total Duration', 'Visit Status', 'Contact Persons',
]

export default function SecurityReport() {
  const { toast }          = useToastContext()
  const [downloaded, setDownloaded] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    mode: 'onTouched',
    defaultValues: { dateFrom: '', dateTo: '' },
  })

  const downloadMutation = useMutation({
    mutationFn: (data) => visitorsApi.downloadReport({ from: data.dateFrom, to: data.dateTo }),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href    = url
      a.setAttribute('download', `visitor-report-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDownloaded(true)
      toast({ title: 'Report Downloaded', variant: 'success' })
      setTimeout(() => setDownloaded(false), 4000)
    },
    onError: () => toast({ title: 'Download Failed', description: 'Please try again.', variant: 'destructive' }),
  })

  const onSubmit = (data) => downloadMutation.mutate(data)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="animate-fadeUp">
        <p className="page-eyebrow mb-1">Security</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>Reports</h1>
      </div>

      <div className="bg-white rounded-2xl animate-fadeUp stagger-1" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <FileText size={16} style={{ color: 'hsl(230 70% 55%)' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>Download Visitor Report</p>
        </div>

        <div className="p-6 space-y-5">
          <p style={{ fontSize: '0.85rem', color: 'hsl(220 10% 52%)', lineHeight: 1.6 }}>
            Export visitor records as a CSV file. Leave both dates empty to download all records.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="From Date" error={errors.dateFrom?.message}>
                <StyledInput
                  type="date"
                  error={errors.dateFrom}
                  {...register('dateFrom')}
                />
              </FormField>

              <FormField label="To Date" error={errors.dateTo?.message}>
                <StyledInput
                  type="date"
                  error={errors.dateTo}
                  {...register('dateTo')}
                />
              </FormField>
            </div>

            {/* What's included info box */}
            <div className="rounded-xl p-4" style={{ background: 'hsl(230 70% 55% / 0.06)', border: '1px solid hsl(230 70% 55% / 0.15)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(230 60% 50%)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Report includes
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {REPORT_FIELDS.map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'hsl(230 70% 55%)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'hsl(222 25% 30%)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={downloadMutation.isPending || isSubmitting}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
              style={{
                background: downloaded
                  ? '#059669'
                  : downloadMutation.isPending
                    ? 'hsl(230 70% 55% / 0.6)'
                    : 'hsl(230 70% 55%)',
                color: 'white',
                fontFamily: 'inherit',
                boxShadow: (downloadMutation.isPending || downloaded) ? 'none' : '0 4px 14px hsl(230 70% 55% / 0.3)',
                cursor: downloadMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {downloadMutation.isPending || isSubmitting
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                : downloaded
                  ? <><CheckCircle2 size={16} /> Downloaded!</>
                  : <><Download size={16} /> Download CSV Report</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
