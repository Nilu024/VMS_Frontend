import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard, Users, UserCheck, LogOut,
  ClipboardList, FileBarChart, UserCog, Menu, X,
  ChevronRight, Building2
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = {
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/roles', icon: UserCog, label: 'Role Creation' },
    { to: '/admin/visitors', icon: Users, label: 'Visitor Details' },
  ],
  security: [
    { to: '/security/checkin', icon: UserCheck, label: 'Visitor Check-In' },
    { to: '/security/checkout', icon: ClipboardList, label: 'Check-Out' },
    { to: '/security/report', icon: FileBarChart, label: 'Reports' },
  ],
  manager: [
    { to: '/manager/visitors', icon: Users, label: 'Active Visitors' },
    { to: '/manager/history', icon: ClipboardList, label: 'Visitor History' },
  ],
  hr: [
    { to: '/hr/visitors', icon: Users, label: 'Active Visitors' },
    { to: '/hr/history', icon: ClipboardList, label: 'Visitor History' },
  ],
}

const roleConfig = {
  admin:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.18)', label: 'Administrator' },
  security: { color: '#60a5fa', bg: 'rgba(96,165,250,0.18)',  label: 'Security Guard' },
  manager:  { color: '#34d399', bg: 'rgba(52,211,153,0.18)',  label: 'Manager' },
  hr:       { color: '#fb923c', bg: 'rgba(251,146,60,0.18)',  label: 'HR Personnel' },
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = navItems[user?.role] || []
  const role = roleConfig[user?.role] || roleConfig.security
  const currentPage = items.find(i => i.to === location.pathname)

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="sidebar flex flex-col h-full">
      <div className="px-5 py-5" style={{ borderBottom: '1px solid hsl(224 25% 17%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(230 70% 55%)', boxShadow: '0 4px 12px hsl(230 70% 55% / 0.4)' }}>
            <Building2 size={15} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'white', fontSize: '0.9rem' }}>VMS</p>
            <p style={{ fontSize: '0.67rem', color: 'hsl(220 15% 48%)', fontWeight: 400 }}>Visitor Management</p>
          </div>
          <button className="ml-auto lg:hidden p-1 rounded-lg transition-colors" style={{ color: 'hsl(220 15% 55%)' }}
            onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mx-3 my-3 p-3 rounded-xl" style={{ background: 'hsl(224 30% 15%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: role.bg, color: role.color, fontSize: '0.95rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }} className="truncate">{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: role.color, fontWeight: 600 }}>{role.label}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-1">
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'hsl(220 15% 38%)', textTransform: 'uppercase', padding: '2px 0 6px' }}>Menu</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-link', active && 'active')}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid hsl(224 25% 17%)' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'hsl(0 60% 62%)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'hsl(0 60% 58% / 0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen" style={{ background: 'hsl(220 20% 97%)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden animate-fadeIn"
          style={{ background: 'rgba(8,12,28,0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 z-30 h-full w-60 transition-transform duration-200 ease-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-5 flex items-center gap-3 flex-shrink-0"
          style={{ background: 'white', borderBottom: '1px solid hsl(220 15% 91%)', boxShadow: '0 1px 4px hsl(220 20% 20% / 0.05)' }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'hsl(222 25% 14%)' }}>
              {currentPage?.label || 'Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(220 10% 58%)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }}></div>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
