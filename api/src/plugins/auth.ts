import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { unauthorized } from "../utils/errors.js";

export const AUTH_COOKIE = "token";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  jwtSecret: string;
}

// Verified user id is available as `request.user.sub` after `authenticate`.
export const authPlugin = fp(
  async (app: FastifyInstance, opts: AuthPluginOptions) => {
    await app.register(cookie);
    await app.register(jwt, {
      secret: opts.jwtSecret,
      cookie: { cookieName: AUTH_COOKIE, signed: false },
    });

    app.decorate("authenticate", async (request: FastifyRequest) => {
      try {
        await request.jwtVerify();
      } catch {
        throw unauthorized();
      }
    });
  },
);
