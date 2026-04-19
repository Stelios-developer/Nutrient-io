import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { alertsStore, nutrientsData, foodsData } from "./store/index";

export const insightsRouter = createRouter({
  listAlerts: publicQuery
    .input(
      z.object({ userId: z.number(), unreadOnly: z.boolean().default(false) }),
    )
    .query(async ({ input }) => {
      return alertsStore
        .listByUser(input.userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }),

  createAlert: publicQuery
    .input(
      z.object({
        userId: z.number(),
        alertType: z.enum([
          "low_intake","high_intake","ul_warning","pattern","achievement","info",
        ]),
        priority: z.enum(["critical","high","medium","low","info"]),
        title: z.string(),
        message: z.string(),
        relatedNutrient: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const a = alertsStore.add({
        userId: input.userId,
        alertType: input.alertType,
        priority: input.priority,
        title: input.title,
        message: input.message,
        relatedNutrient: input.relatedNutrient ?? null,
        isRead: false,
        isDismissed: false,
      });
      return { id: a.id };
    }),

  dismissAlert: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      alertsStore.dismiss(input.id);
      return { success: true };
    }),

  recommendations: publicQuery
    .input(z.object({ userId: z.number(), date: z.string() }))
    .query(async () => {
      const recommendations: Array<{
        nutrient: string;
        displayName: string;
        percentage: number;
        needed: string;
        foods: Array<{ name: string; amount: number; unit: string }>;
      }> = [];

      for (const nutrient of nutrientsData) {
        if (nutrient.rdaMale1940 && Number(nutrient.rdaMale1940) > 0) {
          const key = nutrient.name as keyof (typeof foodsData)[0];
          const topFoods = [...foodsData]
            .filter((f) => Number(f[key]) > 0)
            .sort((a, b) => Number(b[key]) - Number(a[key]))
            .slice(0, 3)
            .map((f) => ({
              name: f.name,
              amount: Math.round(Number(f[key]) * 10) / 10,
              unit: nutrient.unit,
            }));

          if (topFoods.length > 0) {
            recommendations.push({
              nutrient: nutrient.name,
              displayName: nutrient.displayName,
              percentage: 0,
              needed: `${nutrient.rdaMale1940}${nutrient.unit}`,
              foods: topFoods,
            });
          }
        }
      }

      return recommendations.slice(0, 10);
    }),

  topFoodsForNutrient: publicQuery
    .input(z.object({ nutrient: z.string(), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const key = input.nutrient as keyof (typeof foodsData)[0];
      const valid = [
        "protein","carbs","fat","fiber","sodium","potassium","calcium","iron",
        "magnesium","zinc","vitaminC","vitaminD","vitaminA","vitaminE","vitaminK",
        "thiamin","riboflavin","niacin","vitaminB6","folate","vitaminB12",
        "phosphorus","copper","manganese","selenium","iodine","choline","omega3",
      ];
      if (!valid.includes(input.nutrient)) return [];

      return [...foodsData]
        .filter((f) => Number(f[key]) > 0)
        .sort((a, b) => Number(b[key]) - Number(a[key]))
        .slice(0, input.limit)
        .map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          amount: Number(f[key]),
          calories: Number(f.calories),
          servingUnit: f.servingUnit,
        }));
    }),
});
