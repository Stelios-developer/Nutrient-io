import { useState, useCallback } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { getToday } from '@/lib/nutrients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Search, Plus, Minus, X, ChevronLeft, Coffee,
  UtensilsCrossed, Moon, Cookie, Flame
} from 'lucide-react'

const MEAL_TYPES = [
  { value: 'breakfast' as const, label: 'Breakfast', icon: Coffee,          activeClass: 'bg-orange-500 text-white border-orange-500' },
  { value: 'lunch'     as const, label: 'Lunch',     icon: UtensilsCrossed, activeClass: 'bg-green-500 text-white border-green-500' },
  { value: 'dinner'    as const, label: 'Dinner',    icon: Moon,            activeClass: 'bg-blue-500 text-white border-blue-500' },
  { value: 'snack'     as const, label: 'Snack',     icon: Cookie,          activeClass: 'bg-purple-500 text-white border-purple-500' },
]

const CATEGORY_STYLES: Record<string, { icon: string; bg: string; text: string; badge: string }> = {
  'Protein':       { icon: '🥩', bg: 'bg-rose-50 dark:bg-rose-950/30',    text: 'text-rose-600',   badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  'Grains':        { icon: '🌾', bg: 'bg-amber-50 dark:bg-amber-950/30',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  'Vegetables':    { icon: '🥦', bg: 'bg-green-50 dark:bg-green-950/30',  text: 'text-green-600',  badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  'Fruits':        { icon: '🍎', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  'Nuts & Seeds':  { icon: '🥜', bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  'Dairy':         { icon: '🥛', bg: 'bg-sky-50 dark:bg-sky-950/30',      text: 'text-sky-600',    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  'Legumes':       { icon: '🫘', bg: 'bg-teal-50 dark:bg-teal-950/30',    text: 'text-teal-600',   badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  'Fats & Oils':   { icon: '🫒', bg: 'bg-lime-50 dark:bg-lime-950/30',    text: 'text-lime-700',   badge: 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300' },
}
const DEFAULT_CAT = { icon: '🍽️', bg: 'bg-muted/30', text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' }

export function LogFoodPage() {
  const { user } = useAuth()
  const utils = trpc.useUtils()
  const userId = user?.id ?? 1

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [selectedFood, setSelectedFood] = useState<null | { id: number; name: string; servingSize: string; servingUnit: string; calories: string; category: string | null; [key: string]: any }>(null)
  const [servingAmount, setServingAmount] = useState(1)

  const { data: searchResults, isLoading: searching } = trpc.food.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length >= 2 }
  )

  const { data: allFoods } = trpc.food.list.useQuery({ limit: 30 })
  const { data: recentFoods } = trpc.meal.recent.useQuery({ userId, limit: 15 }, { enabled: !!userId })

  const createMeal = trpc.meal.create.useMutation({
    onSuccess: () => {
      utils.dashboard.daily.invalidate()
      utils.meal.recent.invalidate()
      setSelectedFood(null)
      setServingAmount(1)
      setSearchQuery('')
    },
  })

  const handleAddFood = useCallback(() => {
    if (!selectedFood) return
    createMeal.mutate({
      userId,
      entryDate: getToday(),
      mealType: selectedMeal,
      foodId: selectedFood.id,
      servingAmount,
      servingUnit: selectedFood.servingUnit,
    })
  }, [selectedFood, servingAmount, selectedMeal, userId, createMeal])

  const displayFoods = searchQuery.length >= 2 ? searchResults : (recentFoods && recentFoods.length > 0 ? [] : allFoods)

  // ── Food detail panel (right side) ──
  const FoodDetail = () => {
    if (!selectedFood) return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 text-muted-foreground">
        <div className="text-6xl mb-5">🍽️</div>
        <p className="text-lg font-semibold">Select a food</p>
        <p className="text-base mt-1.5">Choose any food from the list to see its details and log it to a meal.</p>
      </div>
    )

    const cat = CATEGORY_STYLES[selectedFood.category ?? ''] ?? DEFAULT_CAT

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedFood(null)} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${cat.bg} flex-shrink-0`}>
            {cat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{selectedFood.name}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>{selectedFood.category}</span>
          </div>
        </div>

        {/* Calories big display */}
        <Card className="border-0 bg-muted/30 shadow-sm">
          <CardContent className="p-6 text-center space-y-1">
            <p className="text-5xl font-black">{Math.round(Number(selectedFood.calories) * servingAmount)}</p>
            <p className="text-base text-muted-foreground">calories per {servingAmount}x serving</p>
          </CardContent>
        </Card>

        {/* Serving size */}
        <div className="space-y-3">
          <p className="text-base font-semibold">Serving Size</p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setServingAmount(Math.max(0.25, servingAmount - 0.25))}
              className="w-12 h-12 rounded-full bg-background border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Minus size={18} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold">{servingAmount}x</p>
              <p className="text-sm text-muted-foreground">{selectedFood.servingUnit}</p>
            </div>
            <button
              onClick={() => setServingAmount(servingAmount + 0.25)}
              className="w-12 h-12 rounded-full bg-background border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <Separator />

        {/* Meal type */}
        <div className="space-y-3">
          <p className="text-base font-semibold">Add to meal</p>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.value}
                  onClick={() => setSelectedMeal(m.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold border transition-all ${
                    selectedMeal === m.value ? m.activeClass : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <Icon size={17} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        <Button
          onClick={handleAddFood}
          className="w-full h-12 text-base font-semibold"
          disabled={createMeal.isPending}
        >
          {createMeal.isPending ? 'Adding...' : `Add to ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`}
        </Button>

        <Separator />

        {/* Nutrients */}
        <div>
          <p className="text-base font-semibold mb-3">Nutrients ({servingAmount}x serving)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein',   value: selectedFood.protein,   unit: 'g' },
              { label: 'Carbs',     value: selectedFood.carbs,     unit: 'g' },
              { label: 'Fat',       value: selectedFood.fat,       unit: 'g' },
              { label: 'Fiber',     value: selectedFood.fiber,     unit: 'g' },
              { label: 'Iron',      value: selectedFood.iron,      unit: 'mg' },
              { label: 'Vit C',     value: selectedFood.vitaminC,  unit: 'mg' },
              { label: 'Calcium',   value: selectedFood.calcium,   unit: 'mg' },
              { label: 'Magnesium', value: selectedFood.magnesium, unit: 'mg' },
              { label: 'Zinc',      value: selectedFood.zinc,      unit: 'mg' },
            ].map((n) => {
              const scaled = Math.round(Number(n.value ?? 0) * servingAmount * 10) / 10
              return (
                <div key={n.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{n.label}</p>
                  <p className="text-base font-bold mt-0.5">{scaled}{n.unit}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-7 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
        <h1 className="text-4xl font-black tracking-tight">Log Food</h1>
        <p className="text-blue-100 mt-1.5">Search and add foods to your daily nutrition log</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-6 items-start">

        {/* ─── LEFT: Search + Food List ─── */}
        <div className="col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods..."
              className="pl-12 h-12 text-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Meal type selector */}
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.value}
                  onClick={() => setSelectedMeal(m.value)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold border transition-all ${
                    selectedMeal === m.value ? m.activeClass : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <Icon size={17} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Food list */}
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {searchQuery.length < 2 && recentFoods && recentFoods.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-5 pt-5 pb-2">
                    🕐 Recently Logged
                  </p>
                  {recentFoods.map((food) => {
                    const fullFood = allFoods?.find((f) => f.id === food.foodId)
                    const cat = CATEGORY_STYLES[fullFood?.category ?? ''] ?? DEFAULT_CAT
                    return (
                      <button
                        key={`recent-${food.foodId}`}
                        disabled={!allFoods}
                        onClick={() => { if (fullFood) setSelectedFood(fullFood as any) }}
                        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed border-b border-border/30 last:border-0 ${
                          selectedFood?.id === food.foodId ? 'bg-accent/50' : ''
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl ${cat.bg}`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate">{food.foodName}</p>
                          <p className="text-sm text-muted-foreground">Recently logged</p>
                        </div>
                        <Flame size={15} className="text-orange-400 flex-shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {searchQuery.length >= 2 && searching && (
                <div className="py-12 text-center text-base text-muted-foreground">Searching...</div>
              )}

              {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                <div className="py-12 text-center text-base text-muted-foreground">No foods found for "{searchQuery}"</div>
              )}

              {(displayFoods ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-5 pt-5 pb-2">
                    {searchQuery.length >= 2 ? '🔍 Search Results' : '🍽️ Browse Foods'}
                  </p>
                  {(displayFoods ?? []).map((food) => {
                    const cat = CATEGORY_STYLES[food.category ?? ''] ?? DEFAULT_CAT
                    return (
                      <button
                        key={food.id}
                        onClick={() => setSelectedFood(food as any)}
                        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors text-left border-b border-border/30 last:border-0 ${
                          selectedFood?.id === food.id ? 'bg-accent/50' : ''
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl ${cat.bg}`}>
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate">{food.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
                              {food.category}
                            </span>
                            <span className="text-sm text-muted-foreground">per {food.servingSize}{food.servingUnit}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className="text-base font-bold tabular-nums">{Math.round(Number(food.calories))}</span>
                          <span className="text-xs text-muted-foreground">kcal</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: Food Detail Panel ─── */}
        <div className="col-span-2">
          <Card className="border shadow-sm min-h-[560px]">
            <CardContent className="p-6 h-full">
              <FoodDetail />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
