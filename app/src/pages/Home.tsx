import { useState } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { getToday, getStatusColor, formatAmount, getNutrientScoreBg } from '@/lib/nutrients'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dumbbell, Wheat, Droplet, Leaf,
  ChevronRight, Plus, AlertTriangle,
  Coffee, UtensilsCrossed, Moon, Cookie, Pill,
  Flame, Zap, CalendarDays, TrendingUp,
} from 'lucide-react'

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Coffee size={17} />,
  lunch: <UtensilsCrossed size={17} />,
  dinner: <Moon size={17} />,
  snack: <Cookie size={17} />,
}

const MEAL_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  breakfast: { bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600', border: 'border-l-orange-400' },
  lunch:     { bg: 'bg-green-50 dark:bg-green-950/30',   icon: 'bg-green-100 dark:bg-green-900/40 text-green-600',   border: 'border-l-green-400' },
  dinner:    { bg: 'bg-blue-50 dark:bg-blue-950/30',     icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600',     border: 'border-l-blue-400' },
  snack:     { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600', border: 'border-l-purple-400' },
}

export function HomePage() {
  const { user } = useAuth()
  const [date] = useState(getToday())
  const userId = user?.id ?? 1

  const { data: dashboard, isLoading } = trpc.dashboard.daily.useQuery({ userId, date })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const score = dashboard?.overallScore ?? 0
  const macroTargets = {
    protein: dashboard?.macros?.protein?.target ?? 56,
    carbs:   dashboard?.macros?.carbs?.target ?? 130,
    fat:     dashboard?.macros?.fat?.target ?? 78,
    fiber:   dashboard?.macros?.fiber?.target ?? 30,
  }
  const macroValues = {
    protein:  dashboard?.totals?.protein  ?? 0,
    carbs:    dashboard?.totals?.carbs    ?? 0,
    fat:      dashboard?.totals?.fat      ?? 0,
    calories: dashboard?.totals?.calories ?? 0,
    fiber:    dashboard?.totals?.fiber    ?? 0,
  }

  const keyNutrients = dashboard?.nutrientStatus
    ?.filter((n) => n.rda > 0 && n.name !== 'calories')
    ?.slice(0, 8) ?? []

  const gaps = dashboard?.gaps ?? []
  const warnings = dashboard?.warnings ?? []

  const scoreGradient =
    score >= 80
      ? 'from-emerald-500 to-teal-500'
      : score >= 60
      ? 'from-amber-400 to-orange-400'
      : 'from-orange-500 to-red-500'

  const scoreMsg =
    score >= 80 ? '🌟 Excellent nutrition today!' :
    score >= 60 ? '💪 Good progress, keep going!' : '🎯 Let\'s fill some gaps!'

  return (
    <div className="space-y-7">
      {/* ── Hero header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-7 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium flex items-center gap-1.5 mb-1">
              <CalendarDays size={14} />
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl font-black tracking-tight">
              Good {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-emerald-100 mt-1">Here's your nutrition summary for today</p>
          </div>
          <Link to="/log">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold h-11 px-5 shadow-sm gap-2">
              <Plus size={18} /> Log Food
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-amber-800 dark:text-amber-300">⚠️ {w.displayName} near upper limit</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">{w.ulPercentage}% of safe maximum</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* ─── LEFT COLUMN ─── */}
        <div className="space-y-5">

          {/* Score card — gradient */}
          <div className={`rounded-2xl bg-gradient-to-br ${scoreGradient} p-6 text-white shadow-lg`}>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">Nutrient Score</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-7xl font-black leading-none">{score}</p>
                <p className="text-white/70 text-lg">/100</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="white" strokeOpacity="0.2" strokeWidth="10" fill="none" />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="white" strokeWidth="10" fill="none"
                    strokeDasharray={`${(score / 100) * 264} 264`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={26} className="text-white" />
                </div>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-3">{scoreMsg}</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange-200" />
                {Math.round(macroValues.calories)} kcal
              </span>
              <span>{dashboard?.mealsLogged ?? 0} meals logged</span>
            </div>
          </div>

          {/* Macros */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Today's Macros</p>
            <div className="grid grid-cols-2 gap-2.5">
              <MacroCard icon={<Dumbbell size={15} />} label="Protein" current={macroValues.protein} target={macroTargets.protein} unit="g" color="blue" />
              <MacroCard icon={<Wheat size={15} />}    label="Carbs"   current={macroValues.carbs}   target={macroTargets.carbs}   unit="g" color="amber" />
              <MacroCard icon={<Droplet size={15} />}  label="Fat"     current={macroValues.fat}     target={macroTargets.fat}     unit="g" color="rose" />
              <MacroCard icon={<Leaf size={15} />}     label="Fiber"   current={macroValues.fiber}   target={macroTargets.fiber}   unit="g" color="green" />
            </div>
          </div>

          {/* Supplements link */}
          <Link to="/supplements" className="block">
            <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
                <Pill size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-violet-700 dark:text-violet-300">Supplements</p>
                <p className="text-sm text-violet-600/70 dark:text-violet-400/70">
                  {dashboard?.supplementsLogged ?? 0} logged today
                </p>
              </div>
              <ChevronRight size={18} className="text-violet-400" />
            </div>
          </Link>
        </div>

        {/* ─── RIGHT COLUMN (2/3) ─── */}
        <div className="col-span-2 space-y-5">

          {/* Key Nutrients */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Key Nutrients</h2>
                <Link to="/nutrients" className="text-sm text-primary flex items-center gap-1 font-medium hover:underline">
                  View all <ChevronRight size={15} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {keyNutrients.map((n) => {
                  const status = getStatusColor(n.status)
                  return (
                    <div key={n.name} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getNutrientScoreBg(n.score)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium truncate">{n.displayName}</span>
                          <span className={`text-sm font-bold tabular-nums ml-3 ${status.text}`}>{n.percentage}%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getNutrientScoreBg(n.score)}`}
                            style={{ width: `${Math.min(n.percentage, 100)}%`, transition: 'width 0.4s ease' }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatAmount(n.amount, n.unit)} / {formatAmount(n.rda, n.unit)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400" />
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Today's Meals</h2>
                <Link to="/log">
                  <Button size="sm" className="h-8 gap-1.5 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0">
                    <Plus size={15} /> Log Food
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              <div className="grid grid-cols-2 gap-3">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                  const summary = dashboard?.mealSummary?.[type] ?? { count: 0, calories: 0 }
                  const style = MEAL_STYLES[type]
                  return (
                    <div key={type} className={`flex items-center gap-4 p-4 rounded-xl border-l-4 ${style.border} ${style.bg} hover:brightness-95 transition-all`}>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                        {MEAL_ICONS[type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold capitalize">{type}</p>
                        {summary.count > 0 ? (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Flame size={12} className="text-orange-400" />
                            {Math.round(summary.calories)} kcal · {summary.count} item{summary.count !== 1 ? 's' : ''}
                          </p>
                        ) : (
                          <Link to="/log">
                            <p className="text-sm text-muted-foreground mt-0.5 hover:text-primary transition-colors">+ Add food</p>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gaps */}
          {gaps.length > 0 && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 to-red-400" />
              <CardHeader className="pb-3 pt-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle size={17} className="text-orange-500" /> Fill the Gaps
                </h2>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <div className="grid grid-cols-3 gap-4">
                  {gaps.slice(0, 3).map((gap) => (
                    <div key={gap.name} className="flex flex-col items-center gap-2 p-5 rounded-xl bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/50 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-md shadow-orange-200">
                        <span className="text-base font-black text-white">{gap.percentage}%</span>
                      </div>
                      <p className="text-base font-bold">{gap.displayName}</p>
                      <p className="text-sm text-muted-foreground">Needs {formatAmount(gap.rda - gap.amount, gap.unit)} more</p>
                      <Link to="/nutrients" className="w-full">
                        <Button size="sm" variant="outline" className="text-sm h-8 border-orange-300 text-orange-700 hover:bg-orange-100 w-full mt-1">Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// ── MacroCard ─────────────────────────────────────────────────────────────────
function MacroCard({ icon, label, current, target, unit, color }: {
  icon: React.ReactNode; label: string; current: number; target: number; unit: string
  color: 'blue' | 'amber' | 'rose' | 'green'
}) {
  const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const styles = {
    blue:  { grad: 'from-blue-500 to-cyan-500',   bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-600 dark:text-blue-400',   bar: 'bg-gradient-to-r from-blue-400 to-cyan-400',   shadow: 'shadow-blue-100 dark:shadow-blue-900/20' },
    amber: { grad: 'from-amber-500 to-orange-400', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-gradient-to-r from-amber-400 to-orange-400', shadow: 'shadow-amber-100 dark:shadow-amber-900/20' },
    rose:  { grad: 'from-rose-500 to-pink-500',    bg: 'bg-rose-50 dark:bg-rose-950/30',   text: 'text-rose-600 dark:text-rose-400',   bar: 'bg-gradient-to-r from-rose-400 to-pink-400',   shadow: 'shadow-rose-100 dark:shadow-rose-900/20' },
    green: { grad: 'from-green-500 to-emerald-500',bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', bar: 'bg-gradient-to-r from-green-400 to-emerald-400',shadow: 'shadow-green-100 dark:shadow-green-900/20' },
  }
  const s = styles[color]

  return (
    <div className={`rounded-xl p-4 ${s.bg} shadow-sm ${s.shadow}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1.5 ${s.text}`}>
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-xs font-bold tabular-nums ${s.text}`}>{pct}%</span>
      </div>
      <p className="text-2xl font-black tabular-nums">
        {Math.round(current)}
        <span className="text-xs font-normal text-muted-foreground ml-1">/ {target}{unit}</span>
      </p>
      <div className="mt-2.5 h-2 rounded-full bg-background/60 dark:bg-background/20 overflow-hidden">
        <div className={`h-full rounded-full ${s.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
