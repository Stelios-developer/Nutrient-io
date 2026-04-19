import { Link, useLocation } from 'react-router'
import { Home, Search, BarChart3, Pill, TrendingUp } from 'lucide-react'

const navItems = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
    activeClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    path: '/log',
    label: 'Log',
    icon: Search,
    activeClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
  },
  {
    path: '/nutrients',
    label: 'Nutrients',
    icon: BarChart3,
    activeClass: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50',
  },
  {
    path: '/supplements',
    label: 'Supps',
    icon: Pill,
    activeClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
  },
  {
    path: '/trends',
    label: 'Trends',
    icon: TrendingUp,
    activeClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
  },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 z-50">
      <nav className="max-w-lg mx-auto bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg shadow-black/5">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? item.activeClass
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
