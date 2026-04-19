import { useParams, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { ChevronLeft, Flame } from 'lucide-react'

const NUTRIENT_FIELDS = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Total Fat', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
  { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
  { key: 'copper', label: 'Copper', unit: 'mg' },
  { key: 'manganese', label: 'Manganese', unit: 'mg' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg' },
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg' },
  { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg' },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg' },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
  { key: 'folate', label: 'Folate', unit: 'mcg' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
  { key: 'choline', label: 'Choline', unit: 'mg' },
  { key: 'omega3', label: 'Omega-3', unit: 'g' },
]

export function FoodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const foodId = parseInt(id ?? '0')

  const { data: food, isLoading } = trpc.food.getById.useQuery({ id: foodId })

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!food) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Food not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    )
  }

  return (
    <div className="p-4 w-full space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold truncate">{food.name}</h1>
      </div>

      <Card className="border-0 shadow-md bg-muted/30">
        <CardContent className="p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Flame size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold">{Math.round(Number(food.calories))}</p>
            <p className="text-sm text-muted-foreground">calories per {food.servingSize}{food.servingUnit}</p>
          </div>
          {food.category && (
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {food.category}
            </span>
          )}
        </CardContent>
      </Card>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Full Nutrient Profile (per serving)</h3>
        {NUTRIENT_FIELDS.map((field) => {
          const value = food[field.key as keyof typeof food]
          if (!value || Number(value) === 0) return null
          return (
            <div key={field.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30">
              <span className="text-sm">{field.label}</span>
              <span className="text-sm font-medium tabular-nums">
                {Math.round(Number(value) * 100) / 100} {field.unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
