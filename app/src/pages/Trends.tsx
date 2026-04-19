import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { getToday, getStatusColor, formatAmount } from '@/lib/nutrients'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Info, Target, Zap } from 'lucide-react'

const TREND_NUTRIENTS = [
  { value: 'protein',   label: 'Protein' },
  { value: 'iron',      label: 'Iron' },
  { value: 'calcium',   label: 'Calcium' },
  { value: 'magnesium', label: 'Magnesium' },
  { value: 'zinc',      label: 'Zinc' },
  { value: 'vitaminC',  label: 'Vitamin C' },
  { value: 'vitaminD',  label: 'Vitamin D' },
  { value: 'vitaminA',  label: 'Vitamin A' },
  { value: 'potassium', label: 'Potassium' },
  { value: 'sodium',    label: 'Sodium' },
  { value: 'fiber',     label: 'Fiber' },
  { value: 'omega3',    label: 'Omega-3' },
]

export function TrendsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? 1
  const [selectedNutrient, setSelectedNutrient] = useState('protein')

  const { data: dashboard } = trpc.dashboard.daily.useQuery({ userId, date: getToday() })
  const { data: trends } = trpc.dashboard.weeklyTrends.useQuery({ userId, nutrient: selectedNutrient, days: 7 })
  const { data: recommendations } = trpc.insights.recommendations.useQuery({ userId, date: getToday() })

  const nutrientDef = dashboard?.nutrientStatus?.find((n) => n.name === selectedNutrient)
  const avg = trends?.values?.length
    ? Math.round(trends.values.reduce((a, b) => a + b, 0) / trends.values.length * 10) / 10
    : 0

  const metricsOnTarget = dashboard?.nutrientStatus?.filter((n) => n.percentage >= 90 && n.rda > 0).length ?? 0
  const totalMetrics = dashboard?.nutrientStatus?.filter((n) => n.rda > 0).length ?? 0

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-7 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
        <h1 className="text-4xl font-black tracking-tight">Insights</h1>
        <p className="text-rose-100 mt-1.5">Your nutrition trends and food recommendations</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-6 text-white shadow-lg shadow-sky-200 dark:shadow-sky-900/30">
          <div className="flex items-center gap-2 text-sky-100 text-xs font-bold uppercase tracking-widest mb-3">
            <Zap size={13} /> Today's Score
          </div>
          <p className="text-5xl font-black">{dashboard?.overallScore ?? 0}<span className="text-xl font-normal text-sky-200">/100</span></p>
          <p className="text-sm text-sky-100 mt-2">{dashboard?.mealsLogged ?? 0} meals · {dashboard?.supplementsLogged ?? 0} supplements</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-widest mb-3">
            <Target size={13} /> Targets Met
          </div>
          <p className="text-5xl font-black">{metricsOnTarget}<span className="text-xl font-normal text-emerald-200"> / {totalMetrics}</span></p>
          <p className="text-sm text-emerald-100 mt-2">nutrients at 90%+ of goal</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
          <div className="flex items-center gap-2 text-orange-100 text-xs font-bold uppercase tracking-widest mb-3">
            <TrendingDown size={13} /> Gaps Today
          </div>
          <p className="text-5xl font-black">{(dashboard?.gaps ?? []).length}</p>
          <p className="text-sm text-orange-100 mt-2">nutrients below target</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-6">

        {/* ─── LEFT: Chart + gaps ─── */}
        <div className="col-span-2 space-y-5">
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-rose-500" />
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={19} className="text-violet-500" /> 7-Day Trend
                </h2>
                <Select value={selectedNutrient} onValueChange={setSelectedNutrient}>
                  <SelectTrigger className="w-44 h-10 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_NUTRIENTS.map((n) => (
                      <SelectItem key={n.value} value={n.value} className="text-base">{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              {trends && trends.values.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-3 h-56 px-2">
                    {(() => {
                      const max = Math.max(...trends.values, nutrientDef?.rda ?? 100)
                      return trends.values.map((value, i) => {
                        const height = max > 0 ? (value / max) * 100 : 0
                        const isToday = i === trends.values.length - 1
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                              {value > 0 ? value : ''}
                            </span>
                            <div className="w-full flex-1 flex items-end">
                              <div
                                className={`w-full rounded-t-lg transition-all ${
                                  isToday
                                    ? 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-lg shadow-violet-200'
                                    : 'bg-gradient-to-t from-violet-300/60 to-violet-200/60 dark:from-violet-800/40 dark:to-violet-700/40'
                                }`}
                                style={{ height: `${Math.max(height, 4)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}>
                              {new Date(trends.dates[i]).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-base text-muted-foreground px-2 pt-3 border-t border-border/40">
                    <span>7-day avg: <strong className="text-foreground">{avg}{nutrientDef?.unit}</strong></span>
                    {nutrientDef?.rda && <span>Target: <strong className="text-foreground">{nutrientDef.rda}{nutrientDef.unit}</strong></span>}
                    {nutrientDef && (
                      <span className={`font-semibold ${getStatusColor(nutrientDef.status).text}`}>{nutrientDef.percentage}% today</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <TrendingUp size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-base">No data yet for this nutrient</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gaps */}
          {(dashboard?.gaps ?? []).length > 0 && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />
              <CardHeader className="pb-3 pt-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingDown size={18} className="text-orange-500" /> Nutrient Gaps Today
                </h2>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  {dashboard?.gaps?.slice(0, 4).map((gap) => {
                    const status = getStatusColor(gap.status)
                    return (
                      <div key={gap.name} className="flex items-center gap-4 p-4 rounded-xl border-l-4 border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/20">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200">
                          <span className="text-base font-black text-white">{gap.percentage}%</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">{gap.displayName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatAmount(gap.amount, gap.unit)} / {formatAmount(gap.rda, gap.unit)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── RIGHT: Recommendations ─── */}
        <div>
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-teal-400 to-cyan-500" />
            <CardHeader className="pb-3 pt-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Info size={18} className="text-cyan-500" /> Recommendations
              </h2>
            </CardHeader>
            <CardContent className="pt-0 pb-5 space-y-3">
              {recommendations && recommendations.length > 0 ? (
                recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.nutrient} className="p-4 rounded-xl border-l-4 border-l-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20">
                    <p className="text-base font-bold mb-1">{rec.displayName}</p>
                    <p className="text-sm text-muted-foreground mb-2.5">Target: {rec.needed}</p>
                    <div className="space-y-1.5">
                      {rec.foods.slice(0, 3).map((food, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{food.name}</span>
                          <span className="font-semibold text-cyan-700 dark:text-cyan-400">{food.amount} {food.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <Info size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base">You're meeting your targets — great job!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
