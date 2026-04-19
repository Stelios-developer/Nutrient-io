import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { getToday } from '@/lib/nutrients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Pill, Plus, Trash2, Check, AlertTriangle, Sparkles } from 'lucide-react'

export function SupplementsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? 1
  const utils = trpc.useUtils()

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [unit, setUnit] = useState('mg')
  const [nutrientInputs, setNutrientInputs] = useState<Record<string, string>>({
    vitaminD: '25', calcium: '0', iron: '0', magnesium: '0',
    zinc: '0', vitaminC: '0', vitaminB12: '0',
  })

  const { data: supplementList, isLoading } = trpc.supplement.list.useQuery({ userId })
  const { data: dailyEntries } = trpc.supplement.dailyEntries.useQuery({ userId, date: getToday() })

  const createSupplement = trpc.supplement.create.useMutation({
    onSuccess: () => { utils.supplement.list.invalidate(); setShowAdd(false); setName(''); setDosage('') },
  })
  const deleteSupplement = trpc.supplement.delete.useMutation({
    onSuccess: () => utils.supplement.list.invalidate(),
  })
  const logEntry = trpc.supplement.logEntry.useMutation({
    onSuccess: () => { utils.supplement.dailyEntries.invalidate(); utils.dashboard.daily.invalidate() },
  })
  const deleteEntry = trpc.supplement.deleteEntry.useMutation({
    onSuccess: () => { utils.supplement.dailyEntries.invalidate(); utils.dashboard.daily.invalidate() },
  })

  const handleCreate = () => {
    if (!name.trim()) return
    const nutrients: Record<string, number> = {}
    for (const [key, value] of Object.entries(nutrientInputs)) {
      const num = parseFloat(value)
      if (num > 0) nutrients[key] = num
    }
    createSupplement.mutate({ userId, name: name.trim(), dosage: dosage ? parseFloat(dosage) : undefined, unit: unit || undefined, nutrients })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-7 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Supplements</h1>
            <p className="text-amber-100 mt-1.5">Track your vitamins and daily supplements</p>
          </div>
          <Button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-white text-amber-700 hover:bg-amber-50 font-semibold h-11 px-5 shadow-sm gap-2"
          >
            <Plus size={18} /> Add Supplement
          </Button>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800">
        <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-base text-amber-700 dark:text-amber-400">
          This app tracks supplement totals combined with food. Watch for upper limit warnings. This is not medical advice.
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* ─── LEFT ─── */}
        <div className="space-y-5">

          {showAdd && (
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardHeader className="pb-3 pt-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={17} className="text-amber-500" /> New Supplement
                </h3>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Input placeholder="Supplement name (e.g., Vitamin D3)" value={name} onChange={(e) => setName(e.target.value)} className="h-11 text-base" />
                <div className="flex gap-2">
                  <Input placeholder="Dosage" type="number" value={dosage} onChange={(e) => setDosage(e.target.value)} className="flex-1 h-11 text-base" />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-3 rounded-md border bg-background text-base">
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="IU">IU</option>
                    <option value="g">g</option>
                  </select>
                </div>
                <Separator />
                <p className="text-sm font-semibold text-muted-foreground">Nutrient content per serving:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'vitaminD', label: 'Vitamin D (mcg)' }, { key: 'calcium', label: 'Calcium (mg)' },
                    { key: 'iron', label: 'Iron (mg)' }, { key: 'magnesium', label: 'Magnesium (mg)' },
                    { key: 'zinc', label: 'Zinc (mg)' }, { key: 'vitaminC', label: 'Vitamin C (mg)' },
                    { key: 'vitaminB12', label: 'Vitamin B12 (mcg)' },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground flex-1">{n.label}</label>
                      <Input type="number" value={nutrientInputs[n.key]} onChange={(e) => setNutrientInputs(prev => ({ ...prev, [n.key]: e.target.value }))} className="w-24 h-9 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 h-10" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button className="flex-1 h-10 bg-gradient-to-r from-amber-500 to-orange-500 border-0" onClick={handleCreate} disabled={createSupplement.isPending}>
                    {createSupplement.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Log */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />
            <CardHeader className="pb-3 pt-6">
              <h3 className="text-lg font-bold">Logged Today</h3>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {dailyEntries && dailyEntries.length > 0 ? (
                dailyEntries.map((entry) => {
                  const suppName = supplementList?.find((s) => s.id === entry.supplementId)?.name ?? `Supplement #${entry.supplementId}`
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
                        <Check size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">{entry.servingsTaken}x {suppName}</p>
                        <p className="text-sm text-muted-foreground">{entry.notes || 'No notes'}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600" onClick={() => deleteEntry.mutate({ id: entry.id })}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Check size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-base text-muted-foreground">Nothing logged yet today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: Library ─── */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Supplement Library</p>
            <p className="text-sm text-muted-foreground">{supplementList?.length ?? 0} supplements</p>
          </div>

          {supplementList && supplementList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {supplementList.map((supp, idx) => {
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-violet-500 to-purple-500',
                  'from-rose-500 to-pink-500',
                  'from-amber-500 to-orange-500',
                  'from-emerald-500 to-teal-500',
                ]
                const grad = gradients[idx % gradients.length]
                return (
                  <Card key={supp.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className={`h-1.5 bg-gradient-to-r ${grad}`} />
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Pill size={22} className="text-white" />
                          </div>
                          <div>
                            <p className="text-base font-bold">{supp.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {supp.dosage ? `${supp.dosage} ${supp.unit}` : 'No dosage set'}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600" onClick={() => deleteSupplement.mutate({ id: supp.id })}>
                          <Trash2 size={15} />
                        </Button>
                      </div>

                      {supp.nutrients && Object.keys(supp.nutrients as object).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(supp.nutrients as Record<string, number>).map(([key, value]) => (
                            <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-muted font-medium">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        className={`w-full h-10 text-sm gap-1.5 font-semibold bg-gradient-to-r ${grad} border-0 hover:opacity-90 transition-opacity`}
                        onClick={() => logEntry.mutate({ userId, supplementId: supp.id, entryDate: getToday() })}
                        disabled={logEntry.isPending}
                      >
                        <Plus size={15} /> Log Today
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                  <Pill size={28} className="text-white" />
                </div>
                <p className="text-lg font-semibold">No supplements yet</p>
                <p className="text-base text-muted-foreground mt-1.5">Click "Add Supplement" to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
