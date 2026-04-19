import { Link, useLocation } from 'react-router'
import { Home, Search, BarChart3, Pill, TrendingUp, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/40',
    inactiveIcon: 'text-emerald-500',
  },
  {
    path: '/log',
    label: 'Log Food',
    icon: Search,
    activeClass: 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40',
    inactiveIcon: 'text-blue-500',
  },
  {
    path: '/nutrients',
    label: 'Nutrients',
    icon: BarChart3,
    activeClass: 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40',
    inactiveIcon: 'text-violet-500',
  },
  {
    path: '/supplements',
    label: 'Supplements',
    icon: Pill,
    activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/40',
    inactiveIcon: 'text-amber-500',
  },
  {
    path: '/trends',
    label: 'Insights',
    icon: TrendingUp,
    activeClass: 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-rose-900/40',
    inactiveIcon: 'text-rose-500',
  },
]

export function SideNav() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-background border-r border-border/60 flex flex-col z-40">
      {/* Logo — gradient accent */}
      <div className="px-6 py-6 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-2xl">🥗</span>
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-white">Nutrient</p>
            <p className="text-xs text-emerald-100/80">Nutrition Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group ${
                isActive
                  ? `${item.activeClass} font-semibold`
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-white/20'
                  : `bg-muted/50 group-hover:bg-accent ${item.inactiveIcon}`
              }`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span className="text-base">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border/40">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            location.pathname === '/profile'
              ? 'bg-slate-100 dark:bg-slate-800 text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name ?? 'Demo User'}</p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
          <User size={15} className="flex-shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  )
}
