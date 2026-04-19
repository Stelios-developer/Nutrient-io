import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { foodsData, foodsById } from "./store/index";

export const foodRouter = createRouter({
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const q = input.query.toLowerCase();
      return foodsData
        .filter((f) => f.name.toLowerCase().includes(q))
        .slice(0, input.limit);
    }),

  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      let results = [...foodsData];
      if (input?.category) {
        results = results.filter((f) => f.category === input.category);
      }
      return results.slice(0, input?.limit ?? 50);
    }),

  categories: publicQuery.query(async () => {
    const cats = new Set(foodsData.map((f) => f.category).filter(Boolean));
    return Array.from(cats);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return foodsById.get(input.id) ?? null;
    }),

  topSources: publicQuery
    .input(z.object({ nutrient: z.string(), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const key = input.nutrient as keyof (typeof foodsData)[0];
      const valid = [
        "protein","carbs","fat","fiber","sodium","potassium","calcium","iron",
        "magnesium","zinc","vitaminC","vitaminD","vitaminA","vitaminE","vitaminK",
        "thiamin","riboflavin","niacin","vitaminB6","folate","vitaminB12",
        "phosphorus","copper","manganese","selenium","iodine","choline","omega3","calories",
      ];
      if (!valid.includes(input.nutrient)) return [];

      return [...foodsData]
        .sort((a, b) => Number(b[key]) - Number(a[key]))
        .slice(0, input.limit)
        .map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          servingUnit: f.servingUnit,
          amount: Number(f[key]),
          calories: Number(f.calories),
        }));
    }),
});
