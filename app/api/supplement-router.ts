import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { supplementsStore, supplementEntriesStore } from "./store/index";

export const supplementRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        name: z.string().min(1),
        dosage: z.number().optional(),
        unit: z.string().optional(),
        nutrients: z.record(z.string(), z.number()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const s = supplementsStore.add({
        userId: input.userId,
        name: input.name,
        dosage: input.dosage != null ? String(input.dosage) : null,
        unit: input.unit ?? null,
        nutrients: input.nutrients ?? {},
      });
      return { id: s.id };
    }),

  list: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => supplementsStore.listByUser(input.userId)),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      supplementsStore.deleteById(input.id);
      return { success: true };
    }),

  logEntry: publicQuery
    .input(
      z.object({
        userId: z.number(),
        supplementId: z.number(),
        entryDate: z.string(),
        servingsTaken: z.number().default(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const se = supplementEntriesStore.add({
        userId: input.userId,
        supplementId: input.supplementId,
        entryDate: new Date(input.entryDate),
        servingsTaken: String(input.servingsTaken),
        notes: input.notes ?? null,
      });
      return { id: se.id };
    }),

  dailyEntries: publicQuery
    .input(z.object({ userId: z.number(), date: z.string() }))
    .query(async ({ input }) =>
      supplementEntriesStore
        .listByUserAndDate(input.userId, input.date)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    ),

  deleteEntry: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      supplementEntriesStore.deleteById(input.id);
      return { success: true };
    }),
});
