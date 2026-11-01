import type { FastifyInstance, FastifyReply } from "fastify";
import { AUTH_COOKIE } from "../../plugins/auth.js";
import { loginBody, registerBody, type PublicUser } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

const SESSION_SECONDS = 60 * 60 * 24 * 7;

export interface AuthRoutesOptions {
  service: AuthService;
  cookieSecure: boolean;
  rateLimitMax: number;
}

export async function authRoutes(
  app: FastifyInstance,
  { service, cookieSecure, rateLimitMax }: AuthRoutesOptions,
) {
  const rateLimit = { max: rateLimitMax, timeWindow: "1 minute" };

  function startSession(reply: FastifyReply, user: PublicUser) {
    const token = app.jwt.sign(
      { sub: user.id },
      { expiresIn: SESSION_SECONDS },
    );
    reply.setCookie(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
  }

  app.post("/register", { config: { rateLimit } }, async (request, reply) => {
    const user = await service.register(registerBody.parse(request.body));
    startSession(reply, user);
    return reply.status(201).send({ user });
  });

  app.post("/login", { config: { rateLimit } }, async (request, reply) => {
    const user = await service.login(loginBody.parse(request.body));
    startSession(reply, user);
    return { user };
  });

  app.post("/logout", { config: { rateLimit } }, async (_request, reply) => {
    reply.clearCookie(AUTH_COOKIE, { path: "/" });
    return reply.status(204).send();
  });

  app.get(
    "/me",
    { preHandler: app.authenticate, config: { rateLimit } },
    async (request) => ({ user: await service.getMe(request.user.sub) }),
  );
}
