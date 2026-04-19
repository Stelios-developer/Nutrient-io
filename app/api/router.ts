import { authRouter } from "./auth-router";
import { foodRouter } from "./food-router";
import { mealRouter } from "./meal-router";
import { supplementRouter } from "./supplement-router";
import { dashboardRouter } from "./dashboard-router";
import { insightsRouter } from "./insights-router";
import { onboardingRouter } from "./onboarding-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  food: foodRouter,
  meal: mealRouter,
  supplement: supplementRouter,
  dashboard: dashboardRouter,
  insights: insightsRouter,
  onboarding: onboardingRouter,
});

export type AppRouter = typeof appRouter;
