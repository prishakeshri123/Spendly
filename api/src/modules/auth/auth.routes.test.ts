import { describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createFakeDb } from "./auth.fake-db.js";

function setup(authRateLimitMax = 100) {
  const { rows, db } = createFakeDb();
  return { rows, app: buildApp({ prisma: db, authRateLimitMax }) };
}

const body = { email: "a@example.com", password: "correct-horse" };

function sessionCookie(res: { cookies: { name: string; value: string }[] }) {
  const c = res.cookies.find((x) => x.name === "token");
  return c ? `token=${c.value}` : undefined;
}

describe("auth routes", () => {
  it("register sets an httpOnly cookie and never returns the hash", async () => {
    const { app } = setup();

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: body,
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().user).toMatchObject({ email: "a@example.com" });
    expect(res.body).not.toContain("passwordHash");
    expect(res.body).not.toContain("argon2");
    expect(res.headers["set-cookie"]).toMatch(/HttpOnly/i);
    await app.close();
  });

  it("register rejects an invalid body with 400", async () => {
    const { app } = setup();

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "not-an-email", password: "short" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("register returns 409 for a duplicate email", async () => {
    const { app } = setup();
    await app.inject({ method: "POST", url: "/auth/register", payload: body });

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: body,
    });

    expect(res.statusCode).toBe(409);
    await app.close();
  });

  it("login sets an httpOnly cookie that GET /auth/me accepts", async () => {
    const { app } = setup();
    await app.inject({ method: "POST", url: "/auth/register", payload: body });

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: body,
    });
    const cookie = sessionCookie(login);
    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie },
    });

    expect(login.statusCode).toBe(200);
    expect(login.headers["set-cookie"]).toMatch(/HttpOnly/i);
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe("a@example.com");
    await app.close();
  });

  it("login returns 401 for a wrong password", async () => {
    const { app } = setup();
    await app.inject({ method: "POST", url: "/auth/register", payload: body });

    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { ...body, password: "wrong-password" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined();
    await app.close();
  });

  it("GET /auth/me returns 401 without a cookie", async () => {
    const { app } = setup();

    const res = await app.inject({ method: "GET", url: "/auth/me" });

    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("GET /auth/me returns 401 for a tampered token", async () => {
    const { app } = setup();

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: "token=not.a.valid-jwt" },
    });

    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("logout clears the cookie", async () => {
    const { app } = setup();

    const res = await app.inject({ method: "POST", url: "/auth/logout" });

    expect(res.statusCode).toBe(204);
    expect(res.headers["set-cookie"]).toMatch(/token=;/);
    await app.close();
  });

  it("rate limits auth routes with 429", async () => {
    const { app } = setup(3);
    const attempt = () =>
      app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { ...body, password: "wrong-password" },
      });

    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await attempt()).statusCode);

    expect(statuses).toEqual([401, 401, 401, 429]);
    await app.close();
  });
});
