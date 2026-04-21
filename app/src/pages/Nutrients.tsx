import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { getToday, getStatusColor, formatAmount, getNutrientScoreBg } from '@/lib/nutrients'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronLeft, AlertTriangle, Info, Sun, Gem, Zap, Sparkles, Layers } from 'lucide-react'

const CATEGORY_CONFIG: Record<string, {
  icon: React.ReactNode; border: string; dot: string; activeTab: string
  activeBg: string; label: string; grad: string
}> = {
  all: {
    icon: <Layers size={16} />,
    border: 'border-l-slate-400',
    dot: 'bg-slate-400',
    activeTab: 'bg-slate-700 text-white shadow-md',
    activeBg: 'bg-slate-50 dark:bg-slate-900/40',
    label: 'All Nutrients',
    grad: 'from-slate-500 to-slate-600',
  },
  vitamin: {
    icon: <Sun size={16} />,
    border: 'border-l-orange-400',
    dot: 'bg-orange-400',
    activeTab: 'bg-orange-500 text-white shadow-md shadow-orange-200',
    activeBg: 'bg-orange-50 dark:bg-orange-950/30',
    label: 'Vitamins',
    grad: 'from-orange-400 to-amber-500',
  },
  mineral: {
    icon: <Gem size={16} />,
    border: 'border-l-sky-400',
    dot: 'bg-sky-400',
    activeTab: 'bg-sky-500 text-white shadow-md shadow-sky-200',
    activeBg: 'bg-sky-50 dark:bg-sky-950/30',
    label: 'Minerals',
    grad: 'from-sky-400 to-blue-500',
  },
  macro: {
    icon: <Zap size={16} />,
    border: 'border-l-emerald-400',
    dot: 'bg-emerald-400',
    activeTab: 'bg-emerald-500 text-white shadow-md shadow-emerald-200',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Macros',
    grad: 'from-emerald-400 to-teal-500',
  },
  other: {
    icon: <Sparkles size={16} />,
    border: 'border-l-violet-400',
    dot: 'bg-violet-400',
    activeTab: 'bg-violet-500 text-white shadow-md shadow-violet-200',
    activeBg: 'bg-violet-50 dark:bg-violet-950/30',
    label: 'Other',
    grad: 'from-violet-400 to-purple-500',
  },
}

export function NutrientsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? 1
  const [activeTab, setActiveTab] = useState('all')
  type NutrientStatus = {
    id: number; name: string; displayName: string; category: string; unit: string;
    amount: number; rda: number; ul: number | null; percentage: number;
    ulPercentage: number | null; status: string; score: number; description: string | null;
  }
  const [selectedNutrient, setSelectedNutrient] = useState<null | NutrientStatus>(null)

  const { data: dashboard, isLoading } = trpc.dashboard.daily.useQuery({ userId, date: getToday() })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const nutrients = dashboard?.nutrientStatus ?? []
  const filtered = activeTab === 'all'
    ? nutrients.filter((n) => n.rda > 0)
    : nutrients.filter((n) => n.category === activeTab && n.rda > 0)
  const categories = ['all', 'vitamin', 'mineral', 'macro', 'other']

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-7 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
        <h1 className="text-4xl font-black tracking-tight">Nutrient Dashboard</h1>
        <p className="text-violet-100 mt-1.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {/* Summary badges */}
        <div className="flex gap-3 mt-5">
          {['optimal', 'adequate', 'low', 'critical'].map((s) => {
            const count = nutrients.filter((n) => n.rda > 0 && n.status === s).length
            if (!count) return null
            const labels: Record<string, { label: string; bg: string }> = {
              optimal:  { label: '✅ Optimal',  bg: 'bg-emerald-400/30 border-emerald-300/40' },
              adequate: { label: '🟡 Adequate', bg: 'bg-yellow-400/30 border-yellow-300/40' },
              low:      { label: '🟠 Low',      bg: 'bg-orange-400/30 border-orange-300/40' },
              critical: { label: '🔴 Critical', bg: 'bg-red-400/30 border-red-300/40' },
            }
            return (
              <div key={s} className={`px-3 py-1.5 rounded-full border backdrop-blur-sm text-sm font-semibold ${labels[s].bg}`}>
                {labels[s].label} · {count}
              </div>
            )
          })}
        </div>
      </div>

      {/* Warnings */}
      {(dashboard?.warnings ?? []).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(dashboard?.warnings ?? []).map((w, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-red-800 dark:text-red-300">⚠️ {w.displayName} Warning</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                  {w.ulPercentage}% of upper limit ({formatAmount(w.amount, w.unit)} / {formatAmount(w.ul ?? 0, w.unit)})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-4 gap-6 items-start">

        {/* ─── LEFT: Category filters ─── */}
        <div className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500" />
            <CardContent className="p-3 space-y-1 pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">Filter by</p>
              {categories.map((c) => {
                const cfg = CATEGORY_CONFIG[c]
                const isActive = activeTab === c
                const count = c === 'all'
                  ? nutrients.filter((n) => n.rda > 0).length
                  : nutrients.filter((n) => n.category === c && n.rda > 0).length
                return (
                  <button
                    key={c}
                    onClick={() => { setActiveTab(c); setSelectedNutrient(null) }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive ? cfg.activeTab : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20' : `bg-gradient-to-br ${cfg.grad} text-white`
                    }`}>
                      {cfg.icon}
                    </div>
                    <span>{cfg.label}</span>
                    <span className={`ml-auto text-sm font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>{count}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {selectedNutrient && (
            <NutrientDetailPanel nutrient={selectedNutrient} onClose={() => setSelectedNutrient(null)} />
          )}
        </div>

        {/* ─── RIGHT: Nutrient grid ─── */}
        <div className="col-span-3">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((n) => {
              const status = getStatusColor(n.status)
              const cfg = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.other
              const isSelected = selectedNutrient?.name === n.name
              return (
                <button
                  key={n.name}
                  onClick={() => setSelectedNutrient(isSelected ? null : n)}
                  className={`flex items-center gap-4 p-5 rounded-xl bg-card border border-l-4 ${cfg.border} hover:shadow-md transition-all text-left ${
                    isSelected ? 'ring-2 ring-violet-400/40 shadow-md' : 'shadow-sm'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ring-4 ring-white dark:ring-card ${getNutrientScoreBg(n.score)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">{n.displayName}</span>
                      <span className={`text-base font-bold tabular-nums ${status.text}`}>{n.percentage}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getNutrientScoreBg(n.score)}`}
                        style={{ width: `${Math.min(n.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm text-muted-foreground">{formatAmount(n.amount, n.unit)} of {formatAmount(n.rda, n.unit)}</span>
                      {n.ul && <span className="text-xs text-muted-foreground">UL: {formatAmount(n.ul, n.unit)}</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

type NutrientStatus = { id: number; name: string; displayName: string; category: string; unit: string; amount: number; rda: number; ul: number | null; percentage: number; ulPercentage: number | null; status: string; score: number; description: string | null }
type TopFood = { id: number; name: string; category: string | null; amount: number; calories: number; servingUnit: string }

function NutrientDetailPanel({ nutrient, onClose }: { nutrient: NutrientStatus; onClose: () => void }) {
  const status = getStatusColor(nutrient.status)
  const cfg = CATEGORY_CONFIG[nutrient.category] ?? CATEGORY_CONFIG.other

  const { data: topFoods } = trpc.insights.topFoodsForNutrient.useQuery(
    { nutrient: nutrient.name, limit: 5 },
    { enabled: !!nutrient.name }
  )

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${cfg.grad}`} />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            <h3 className="text-base font-bold">{nutrient.displayName}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-5 pt-0">
        <div className={`p-5 rounded-xl ${status.bg} text-center`}>
          <p className="text-4xl font-black">{nutrient.percentage}%</p>
          <p className={`text-base font-bold mt-1 ${status.text}`}>{status.label}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatAmount(nutrient.amount, nutrient.unit)} of {formatAmount(nutrient.rda, nutrient.unit)}
          </p>
          <div className="mt-3 h-2 rounded-full bg-white/40 dark:bg-black/10 overflow-hidden">
            <div className={`h-full rounded-full ${getNutrientScoreBg(nutrient.score)}`} style={{ width: `${Math.min(nutrient.percentage, 100)}%` }} />
          </div>
        </div>

        {nutrient.description && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <Info size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{nutrient.description}</p>
          </div>
        )}

        {topFoods && topFoods.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2">Top Food Sources</p>
            <div className="space-y-2">
              {topFoods.slice(0, 4).map((food: TopFood) => (
                <div key={food.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border text-sm">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.grad} flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                    {Math.round(food.amount)}
                  </div>
                  <p className="font-medium truncate flex-1">{food.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
