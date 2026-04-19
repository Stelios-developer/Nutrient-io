import * as jose from "jose";

const JWT_ALG = "HS256";
// Use env var if available, fallback to dev secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-secret-please-change-in-production"
);

export type SessionPayload = {
  userId: number;
};

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new jose.SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const userId = payload.userId;
    if (typeof userId !== "number") return null;
    return { userId };
  } catch {
    return null;
  }
}
