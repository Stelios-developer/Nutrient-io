import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "./session";
import { usersStore } from "../store/index";
import { Errors } from "@contracts/errors";
import type { User } from "@db/schema";

export async function authenticateRequest(
  headers: Headers
): Promise<User> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("No session cookie found.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid or expired session token.");
  }
  const user = usersStore.findById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please log in again.");
  }
  return user;
}
