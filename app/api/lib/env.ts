import "dotenv/config";

export const env = {
  jwtSecret:
    process.env.JWT_SECRET ||
    "local-dev-secret-please-change-in-production",
  isProduction: process.env.NODE_ENV === "production",
};
