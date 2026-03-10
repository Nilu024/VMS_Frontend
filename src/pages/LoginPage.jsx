import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/api'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/lib/schemas'
import { FormField, StyledInput, SubmitButton } from '@/components/ui/FormComponents'
import { Eye, EyeOff, ArrowRight, Building2, Shield, UserCheck, Users } from 'lucide-react'

const roleRoutes = {
  admin: '/admin/dashboard',
  security: '/security/checkin',
  manager: '/manager/visitors',
  hr: '/hr/visitors',
}

const roles = [
  { label: 'Admin',    icon: Shield,     color: '#a78bfa' },
  { label: 'Security', icon: UserCheck,  color: '#60a5fa' },
  { label: 'Manager',  icon: Users,      color: '#34d399' },
  { label: 'HR',       icon: Users,      color: '#fb923c' },
]

export default function LoginPage() {
  const navigate   = useNavigate()
  const { login }  = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [serverErr, setServerErr] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      login(res.data.token, res.data.user)
      navigate(roleRoutes[res.data.user.role] || '/')
    },
    onError: (err) => {
      setServerErr(err.response?.data?.message || 'Invalid credentials. Please try again.')
    },
  })

  const onSubmit = (data) => {
    setServerErr('')
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'hsl(224 36% 11%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(hsl(230 70% 55%) 1px, transparent 1px), linear-gradient(90deg, hsl(230 70% 55%) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(230 70% 60%), transparent 70%)' }} />

        {/* Brand */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(230 70% 55%)', boxShadow: '0 4px 16px hsl(230 70% 55% / 0.5)' }}>
              <Building2 size={18} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>VMS</span>
          </div>
          <h1 style={{ color: 'white', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Visitor<br />Management<br />System
          </h1>
          <p style={{ color: 'hsl(220 15% 55%)', marginTop: '1rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            A complete platform for managing<br />visitors, tracking entries, and<br />generating audit reports.
          </p>
        </div>

        {/* Role list */}
        <div className="relative space-y-3">
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'hsl(220 15% 40%)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Available Roles
          </p>
          {roles.map(({ label, icon: Icon, color }, i) => (
            <div key={label} className="flex items-center gap-3 animate-slideRight" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '22', color }}>
                <Icon size={13} />
              </div>
              <span style={{ color: 'hsl(220 15% 65%)', fontSize: '0.85rem' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'hsl(220 20% 97%)' }}>
        <div className="w-full max-w-[380px] animate-fadeUp">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(230 70% 55%)' }}>
              <Building2 size={14} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(222 25% 12%)' }}>VMS</span>
          </div>

          <div className="mb-8">
            <p className="page-eyebrow mb-2">Welcome back</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'hsl(222 25% 10%)', lineHeight: 1.1 }}>
              Sign in to your account
            </h2>
            <p style={{ color: 'hsl(220 10% 55%)', marginTop: '6px', fontSize: '0.9rem' }}>
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Username */}
            <FormField label="Username" required error={errors.username?.message}>
              <StyledInput
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                error={errors.username}
                {...register('username')}
              />
            </FormField>

            {/* Password */}
            <FormField label="Password" required error={errors.password?.message}>
              <div className="relative">
                <StyledInput
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password}
                  style={{ paddingRight: '2.75rem' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'hsl(220 10% 58%)' }}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            {/* Server error */}
            {serverErr && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl text-sm animate-scaleIn"
                style={{ background: 'hsl(0 72% 58% / 0.08)', border: '1px solid hsl(0 72% 58% / 0.2)', color: 'hsl(0 65% 45%)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                {serverErr}
              </div>
            )}

            <SubmitButton
              loading={loginMutation.isPending || isSubmitting}
              loadingText="Signing in…"
            >
              Sign In <ArrowRight size={15} />
            </SubmitButton>
          </form>

        </div>
      </div>
    </div>
  )
}
