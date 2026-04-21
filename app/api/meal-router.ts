import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { foodsById, mealStore } from "./store/index";

const NUTRIENT_COLUMNS = [
  "calories","protein","carbs","fat","fiber","sugars","saturatedFat",
  "sodium","potassium","calcium","iron","magnesium","zinc",
  "phosphorus","copper","manganese","selenium","iodine",
  "vitaminA","vitaminC","vitaminD","vitaminE","vitaminK",
  "thiamin","riboflavin","niacin","vitaminB6","folate","vitaminB12",
  "choline","omega3","cholesterol",
] as const;

function calculateNutrients(
  food: Record<string, string | number | null | Date>,
  servingAmount: number,
  _servingSize: number, // reserved for future bioavailability calculations
): Record<string, number> {
  // Nutrient values in food data are already stored per 1 serving (per servingSize amount).
  // servingAmount is a multiplier (e.g. 5 = "5 servings"), so we just multiply directly.
  const nutrients: Record<string, number> = {};
  for (const col of NUTRIENT_COLUMNS) {
    const val = food[col];
    if (val != null) {
      nutrients[col] = Math.round(Number(val) * servingAmount * 100) / 100;
    }
  }
  return nutrients;
}

export const mealRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        entryDate: z.string(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        foodId: z.number(),
        servingAmount: z.number().positive(),
        servingUnit: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const food = foodsById.get(input.foodId);
      if (!food) throw new Error("Food not found");

      const calculatedNutrients = calculateNutrients(
        food as unknown as Record<string, string | number | null | Date>,
        input.servingAmount,
        Number(food.servingSize),
      );
      const totalCalories = calculatedNutrients.calories ?? 0;

      const entry = mealStore.add({
        userId: input.userId,
        entryDate: new Date(input.entryDate),
        mealType: input.mealType,
        foodId: input.foodId,
        foodName: food.name,
        servingAmount: String(input.servingAmount),
        servingUnit: input.servingUnit,
        calculatedNutrients,
        totalCalories: String(totalCalories),
        notes: input.notes ?? null,
      });

      return { id: entry.id, calculatedNutrients, totalCalories };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      mealStore.deleteById(input.id);
      return { success: true };
    }),

  listByDate: publicQuery
    .input(z.object({ userId: z.number(), date: z.string() }))
    .query(async ({ input }) => {
      return mealStore
        .listByUserAndDate(input.userId, input.date)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }),

  dailyTotals: publicQuery
    .input(z.object({ userId: z.number(), date: z.string() }))
    .query(async ({ input }) => {
      const entries = mealStore.listByUserAndDate(input.userId, input.date);
      const totals: Record<string, number> = {};
      for (const col of NUTRIENT_COLUMNS) totals[col] = 0;

      for (const entry of entries) {
        const nutrients = entry.calculatedNutrients as Record<string, number> | null;
        if (nutrients) {
          for (const [key, value] of Object.entries(nutrients)) {
            if (totals[key] !== undefined) {
              totals[key] = Math.round((totals[key] + value) * 100) / 100;
            }
          }
        }
      }

      return { entries, totals, count: entries.length };
    }),

  recent: publicQuery
    .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const seen = new Set<number>();
      return mealStore
        .listByUser(input.userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .filter((e) => {
          if (seen.has(e.foodId)) return false;
          seen.add(e.foodId);
          return true;
        })
        .slice(0, input.limit)
        .map((e) => ({ foodId: e.foodId, foodName: e.foodName }));
    }),
});
