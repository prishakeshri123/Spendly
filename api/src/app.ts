import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { env } from "./config/env.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { accountsRoutes } from "./modules/accounts/accounts.routes.js";
import { createAccountsService } from "./modules/accounts/accounts.service.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { createAuthService } from "./modules/auth/auth.service.js";
import { authPlugin } from "./plugins/auth.js";
import { createPrisma } from "./plugins/prisma.js";
import { registerErrorHandler } from "./utils/errors.js";

export interface BuildAppOptions {
  // Injected in tests; defaults to a real client built from DATABASE_URL.
  prisma?: Pick<PrismaClient, "user" | "account">;
  // Max requests per minute per IP on each auth route.
  authRateLimitMax?: number;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: {
      redact: [
        "req.headers.cookie",
        "req.headers.authorization",
        'res.headers["set-cookie"]',
      ],
    },
  });

  registerErrorHandler(app);

  let ownedPrisma: PrismaClient | undefined;
  const getPrisma = () => {
    if (options.prisma) return options.prisma;
    ownedPrisma ??= createPrisma(env.DATABASE_URL);
    return ownedPrisma;
  };
  app.addHook("onClose", async () => {
    await ownedPrisma?.$disconnect();
  });

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(rateLimit, { global: false });
  app.register(authPlugin, { jwtSecret: env.JWT_SECRET });

  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes, {
    prefix: "/auth",
    service: createAuthService(getPrisma()),
    cookieSecure: env.NODE_ENV === "production",
    rateLimitMax: options.authRateLimitMax ?? 10,
  });

  app.register(accountsRoutes, {
    prefix: "/accounts",
    service: createAccountsService(getPrisma()),
  });

  return app;
}
