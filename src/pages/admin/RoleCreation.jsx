import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usersApi } from '@/api'
import { useToastContext } from '@/hooks/ToastContext'
import { createUserSchema } from '@/lib/schemas'
import { FormField, StyledInput, SubmitButton, DangerButton } from '@/components/ui/FormComponents'
import { Loader2, Plus, Trash2, Shield, UserCog, Users, X } from 'lucide-react'

const roleInfo = {
  security: { icon: Shield,   color: '#3b82f6', bg: '#eff6ff', label: 'Security', desc: 'Gate check-in & check-out' },
  manager:  { icon: UserCog,  color: '#10b981', bg: '#ecfdf5', label: 'Manager',  desc: 'Meeting reviews & approvals' },
  hr:       { icon: Users,    color: '#f59e0b', bg: '#fffbeb', label: 'HR',       desc: 'HR-related visitor handling' },
}

export default function RoleCreation() {
  const { toast }        = useToastContext()
  const queryClient      = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched',
    defaultValues: { name: '', username: '', password: '', role: undefined },
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User Created', description: 'Account created successfully.', variant: 'success' })
      reset()
      setShowForm(false)
    },
    onError: (err) =>
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create user', variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'Deleted', description: 'User removed.' })
      setDeleteId(null)
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' }),
  })

  const onSubmit = (data) => createMutation.mutate(data)
  const nonAdminUsers = users?.filter(u => u.role !== 'admin') || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fadeUp">
        <div>
          <p className="page-eyebrow mb-1">Administration</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'hsl(222 25% 10%)' }}>
            Role Creation
          </h1>
        </div>
        <button
          onClick={() => { reset(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'hsl(230 70% 55%)', color: 'white', boxShadow: '0 4px 12px hsl(230 70% 55% / 0.3)', fontFamily: 'inherit' }}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Role overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeUp stagger-1">
        {Object.entries(roleInfo).map(([role, { icon: Icon, color, bg, label, desc }]) => {
          const count = nonAdminUsers.filter(u => u.role === role).length
          return (
            <div key={role} className="bg-white rounded-2xl p-5" style={{ border: '1px solid hsl(220 15% 91%)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color, letterSpacing: '-0.04em' }}>{count}</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>{label}</p>
              <p style={{ fontSize: '0.75rem', color: 'hsl(220 10% 58%)', marginTop: '2px' }}>{desc}</p>
            </div>
          )
        })}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl animate-fadeUp stagger-2" style={{ border: '1px solid hsl(220 15% 91%)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(222 25% 12%)' }}>All Users</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} style={{ color: 'hsl(230 70% 55%)' }} className="animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full vms-table">
              <thead>
                <tr>
                  {['Name', 'Username', 'Role', 'Status', 'Created', ''].map(h => (
                    <th key={h} className="text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nonAdminUsers.length > 0 ? nonAdminUsers.map(u => {
                  const ri = roleInfo[u.role]
                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem', color: 'hsl(222 25% 12%)' }}>{u.name}</td>
                      <td>
                        <code style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'hsl(220 10% 45%)' }}>
                          {u.username}
                        </code>
                      </td>
                      <td>
                        <span style={{ background: ri?.bg, color: ri?.color, padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {ri?.label || u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: u.isActive ? '#dcfce7' : '#fee2e2',
                          color:      u.isActive ? '#15803d' : '#dc2626',
                          padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'hsl(220 10% 55%)', fontSize: '0.78rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <button
                          onClick={() => setDeleteId(u._id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'hsl(0 72% 62%)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'hsl(0 72% 58% / 0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(220 10% 65%)', fontSize: '0.85rem' }}>
                      No users yet. Click "Add User" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create user slide-over ── */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 animate-fadeIn"
            style={{ background: 'rgba(8,12,28,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => { reset(); setShowForm(false) }}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slideRight"
            style={{ borderLeft: '1px solid hsl(220 15% 91%)' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid hsl(220 15% 93%)' }}>
              <div>
                <p className="page-eyebrow mb-0.5">New User</p>
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'hsl(222 25% 10%)' }}>Create Account</p>
              </div>
              <button onClick={() => { reset(); setShowForm(false) }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X size={18} style={{ color: 'hsl(220 10% 50%)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Full Name */}
                <FormField label="Full Name" required error={errors.name?.message}>
                  <StyledInput
                    placeholder="e.g. Rahul Sharma"
                    error={errors.name}
                    {...register('name')}
                  />
                </FormField>

                {/* Username */}
                <FormField label="Username" required error={errors.username?.message}
                  hint="letters, numbers, dots, hyphens">
                  <StyledInput
                    placeholder="e.g. rahul.sharma"
                    autoComplete="off"
                    error={errors.username}
                    {...register('username')}
                  />
                </FormField>

                {/* Password */}
                <FormField label="Password" required error={errors.password?.message}>
                  <StyledInput
                    type="password"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    error={errors.password}
                    {...register('password')}
                  />
                </FormField>

                {/* Role — Controller + visual toggle */}
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormField label="Role" required error={errors.role?.message}>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {Object.entries(roleInfo).map(([role, { icon: Icon, color, bg, label }]) => (
                          <button
                            type="button"
                            key={role}
                            onClick={() => field.onChange(role)}
                            className="p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center"
                            style={{
                              border:     `1.5px solid ${field.value === role ? color : 'hsl(220 15% 88%)'}`,
                              background:  field.value === role ? bg : 'white',
                              boxShadow:   field.value === role ? `0 4px 12px ${color}22` : 'none',
                            }}
                          >
                            <Icon size={16} color={field.value === role ? color : 'hsl(220 10% 60%)'} />
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: field.value === role ? color : 'hsl(220 10% 50%)',
                            }}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </FormField>
                  )}
                />

                <SubmitButton loading={createMutation.isPending || isSubmitting} loadingText="Creating…">
                  Create User
                </SubmitButton>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 animate-fadeIn flex items-center justify-center p-4"
          style={{ background: 'rgba(8,12,28,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scaleIn" style={{ border: '1px solid hsl(220 15% 91%)' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(222 25% 10%)', marginBottom: '6px' }}>Delete User?</p>
            <p style={{ fontSize: '0.85rem', color: 'hsl(220 10% 50%)', marginBottom: '20px' }}>
              This action cannot be undone. All data associated with this user will be removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: '1.5px solid hsl(220 15% 88%)', background: 'white', color: 'hsl(220 10% 40%)', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <DangerButton
                loading={deleteMutation.isPending}
                loadingText="Deleting…"
                onClick={() => deleteMutation.mutate(deleteId)}
              >
                Delete
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
