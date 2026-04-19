import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { usersStore } from "./store/index";

export const onboardingRouter = createRouter({
  updateProfile: publicQuery
    .input(
      z.object({
        userId: z.number(),
        dateOfBirth: z.string().optional(),
        sex: z.enum(["male", "female"]).optional(),
        heightCm: z.number().optional(),
        weightKg: z.number().optional(),
        lifeStage: z
          .enum(["none", "pregnant", "lactating"])
          .optional(),
        activityLevel: z
          .enum([
            "sedentary",
            "lightly_active",
            "moderately_active",
            "very_active",
            "extremely_active",
          ])
          .optional(),
        region: z.string().optional(),
        onboarded: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, ...data } = input;
      const patch: Record<string, unknown> = {};
      if (data.dateOfBirth !== undefined) patch.dateOfBirth = data.dateOfBirth;
      if (data.sex !== undefined) patch.sex = data.sex;
      if (data.heightCm !== undefined) patch.heightCm = String(data.heightCm);
      if (data.weightKg !== undefined) patch.weightKg = String(data.weightKg);
      if (data.lifeStage !== undefined) patch.lifeStage = data.lifeStage;
      if (data.activityLevel !== undefined) patch.activityLevel = data.activityLevel;
      if (data.region !== undefined) patch.region = data.region;
      if (data.onboarded !== undefined) patch.onboarded = data.onboarded;

      usersStore.update(userId, patch as any);
      return { success: true };
    }),

  getProfile: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return usersStore.findById(input.userId) ?? null;
    }),
});
