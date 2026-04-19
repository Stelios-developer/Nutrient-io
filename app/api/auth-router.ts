import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { signSessionToken } from "./local-auth/session";
import { usersStore } from "./store/index";

export const authRouter = createRouter({
  // Returns the currently authenticated user, or null
  me: authedQuery.query((opts) => opts.ctx.user),

  // Login — accepts the user's name and saves it before creating the session
  login: publicQuery
    .input(z.object({ name: z.string().min(1).max(80) }))
    .mutation(async ({ ctx, input }) => {
    const user = usersStore.findById(1);
    if (!user) throw new Error("User not found");

    // Save the name they entered
    usersStore.update(1, { name: input.name.trim() });

    const updatedUser = usersStore.findById(1)!;
    const token = await signSessionToken({ userId: updatedUser.id });
    const cookieOpts = getSessionCookieOptions(ctx.req.headers);

    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly,
        path: cookieOpts.path ?? "/",
        sameSite: (cookieOpts.sameSite?.toString().toLowerCase() ?? "lax") as
          | "lax"
          | "none"
          | "strict",
        secure: cookieOpts.secure,
        maxAge: Session.maxAgeMs / 1000,
      }),
    );

    return { success: true, user: updatedUser };
  }),

  // Logout — clears the session cookie
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path ?? "/",
        sameSite: (opts.sameSite?.toString().toLowerCase() ?? "lax") as
          | "lax"
          | "none"
          | "strict",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
