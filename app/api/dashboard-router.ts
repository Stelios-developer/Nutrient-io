import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  usersStore,
  nutrientsData,
  mealStore,
  supplementEntriesStore,
  supplementsStore,
} from "./store/index";
import type { Nutrient, User } from "@db/schema";

const NUTRIENT_NAMES = [
  "calories","protein","carbs","fat","fiber","sugars","saturatedFat",
  "sodium","potassium","calcium","iron","magnesium","zinc",
  "phosphorus","copper","manganese","selenium","iodine",
  "vitaminA","vitaminC","vitaminD","vitaminE","vitaminK",
  "thiamin","riboflavin","niacin","vitaminB6","folate","vitaminB12",
  "choline","omega3","cholesterol",
];

function getUserRDA(user: User | undefined, nutrient: Nutrient): number {
  if (!user || !nutrient) return Number(nutrient?.rdaMale1940 ?? 0);
  const isFemale = user.sex === "female";
  return Number(
    isFemale
      ? nutrient.rdaFemale1940 ?? nutrient.rdaMale1940 ?? 0
      : nutrient.rdaMale1940 ?? 0,
  );
}

function getUserUL(user: User | undefined, nutrient: Nutrient): number | null {
  if (!user || !nutrient) return null;
  const isFemale = user.sex === "female";
  const ul = isFemale ? nutrient.ulFemale : nutrient.ulMale;
  return ul ? Number(ul) : null;
}

function getStatusColor(pct: number, ulPct: number | null): string {
  if (ulPct !== null && ulPct > 100) return "danger";
  if (ulPct !== null && ulPct > 80) return "warning";
  if (pct < 25) return "critical";
  if (pct < 50) return "low";
  if (pct < 75) return "suboptimal";
  if (pct < 90) return "adequate";
  if (pct <= 110) return "optimal";
  if (pct <= 150) return "high";
  return "very-high";
}

function getNutrientScore(pct: number): number {
  if (pct >= 90 && pct <= 110) return 100;
  if (pct >= 75) return 80;
  if (pct >= 50) return 60;
  if (pct >= 25) return 40;
  return 20;
}

export const dashboardRouter = createRouter({
  daily: publicQuery
    .input(z.object({ userId: z.number(), date: z.string() }))
    .query(async ({ input }) => {
      const user = usersStore.findById(input.userId);
      const meals = mealStore.listByUserAndDate(input.userId, input.date);
      const suppEntries = supplementEntriesStore.listByUserAndDate(
        input.userId,
        input.date,
      );

      // Calculate totals
      const totals: Record<string, number> = {};
      for (const n of NUTRIENT_NAMES) totals[n] = 0;

      for (const meal of meals) {
        const n = meal.calculatedNutrients;
        if (n) {
          for (const [key, val] of Object.entries(n)) {
            if (totals[key] !== undefined)
              totals[key] = Math.round((totals[key] + val) * 100) / 100;
          }
        }
      }

      for (const entry of suppEntries) {
        const supplement = supplementsStore.findById(entry.supplementId);
        if (supplement?.nutrients) {
          const servings = Number(entry.servingsTaken) || 1;
          for (const [key, val] of Object.entries(
            supplement.nutrients as Record<string, number>,
          )) {
            if (totals[key] !== undefined)
              totals[key] =
                Math.round((totals[key] + val * servings) * 100) / 100;
          }
        }
      }

      // Build nutrient status
      const nutrientStatus = nutrientsData.map((n) => {
        const rda = getUserRDA(user, n);
        const ul = getUserUL(user, n);
        const amount = totals[n.name] ?? 0;
        const pct = rda > 0 ? Math.round((amount / rda) * 100) : 0;
        const ulPct = ul && ul > 0 ? Math.round((amount / ul) * 100) : null;
        return {
          id: n.id,
          name: n.name,
          displayName: n.displayName,
          category: n.category,
          unit: n.unit,
          amount,
          rda,
          ul,
          percentage: pct,
          ulPercentage: ulPct,
          status: getStatusColor(pct, ulPct),
          score: getNutrientScore(pct),
          description: n.description,
        };
      });

      const scoredNutrients = nutrientStatus.filter(
        (n) => n.rda > 0 && n.name !== "calories",
      );
      const overallScore =
        scoredNutrients.length > 0
          ? Math.round(
              scoredNutrients.reduce((sum, n) => sum + n.score, 0) /
                scoredNutrients.length,
            )
          : 0;

      const byCategory: Record<string, typeof nutrientStatus> = {};
      for (const n of nutrientStatus) {
        if (!byCategory[n.category]) byCategory[n.category] = [];
        byCategory[n.category].push(n);
      }

      const gaps = nutrientStatus
        .filter((n) => n.percentage < 50 && n.rda > 0 && n.name !== "calories")
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 5);

      const warnings = nutrientStatus.filter(
        (n) => n.ulPercentage !== null && n.ulPercentage > 80,
      );

      const caloriesNutrient = nutrientsData.find((n) => n.name === "calories");
      const macros = {
        calories: { consumed: totals.calories, target: getUserRDA(user, caloriesNutrient ?? nutrientsData[0]) },
        protein: { consumed: totals.protein, target: getUserRDA(user, nutrientsData.find((n) => n.name === "protein") ?? nutrientsData[0]) },
        carbs: { consumed: totals.carbs, target: getUserRDA(user, nutrientsData.find((n) => n.name === "carbs") ?? nutrientsData[0]) },
        fat: { consumed: totals.fat, target: getUserRDA(user, nutrientsData.find((n) => n.name === "fat") ?? nutrientsData[0]) },
        fiber: { consumed: totals.fiber, target: getUserRDA(user, nutrientsData.find((n) => n.name === "fiber") ?? nutrientsData[0]) },
      };

      const mealSummary = {
        breakfast: { count: 0, calories: 0 },
        lunch: { count: 0, calories: 0 },
        dinner: { count: 0, calories: 0 },
        snack: { count: 0, calories: 0 },
      };
      for (const meal of meals) {
        const type = meal.mealType as keyof typeof mealSummary;
        if (mealSummary[type]) {
          mealSummary[type].count++;
          mealSummary[type].calories += Number(meal.totalCalories) || 0;
        }
      }

      return {
        date: input.date,
        overallScore,
        totals,
        nutrientStatus,
        byCategory,
        gaps,
        warnings,
        macros,
        mealSummary,
        mealsLogged: meals.length,
        supplementsLogged: suppEntries.length,
      };
    }),

  weeklyTrends: publicQuery
    .input(
      z.object({
        userId: z.number(),
        nutrient: z.string(),
        days: z.number().default(7),
      }),
    )
    .query(async ({ input }) => {
      const dates: string[] = [];
      const values: number[] = [];

      for (let i = input.days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        dates.push(dateStr);

        const entries = mealStore.listByUserAndDate(input.userId, dateStr);
        let total = 0;
        for (const entry of entries) {
          const n = entry.calculatedNutrients;
          if (n && n[input.nutrient]) total += n[input.nutrient];
        }
        values.push(Math.round(total * 100) / 100);
      }

      return { dates, values };
    }),
});
