import { describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createFakeDb } from "../auth/auth.fake-db.js";

function setup() {
  const { db } = createFakeDb();
  return buildApp({ prisma: db, authRateLimitMax: 100 });
}

async function signUp(app: ReturnType<typeof setup>, email: string) {
  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: { email, password: "correct-horse" },
  });
  const token = res.cookies.find((c) => c.name === "token")?.value;
  return { cookie: `token=${token}` };
}

describe("accounts routes", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const app = setup();

    const res = await app.inject({ method: "GET", url: "/accounts" });

    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("creates, lists, updates and archives an account", async () => {
    const app = setup();
    const { cookie } = await signUp(app, "a@example.com");

    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload: { name: "Cash", type: "CASH", openingBalance: 1000 },
    });
    expect(created.statusCode).toBe(201);
    const { id } = created.json().account;
    expect(created.body).not.toContain("userId");

    const patched = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie },
      payload: { name: "Pocket cash" },
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.json().account.name).toBe("Pocket cash");

    const currencyChange = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie },
      payload: { currency: "USD" },
    });
    expect(currencyChange.statusCode).toBe(400);

    const archived = await app.inject({
      method: "DELETE",
      url: `/accounts/${id}`,
      headers: { cookie },
    });
    expect(archived.statusCode).toBe(204);

    const active = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: { cookie },
    });
    expect(active.json().accounts).toEqual([]);

    const all = await app.inject({
      method: "GET",
      url: "/accounts?includeArchived=true",
      headers: { cookie },
    });
    expect(all.json().accounts).toHaveLength(1);
    await app.close();
  });

  it.each([
    ["a float opening balance", { name: "X", openingBalance: 10.5 }],
    ["an unknown type", { name: "X", type: "CRYPTO" }],
    ["a bad currency", { name: "X", currency: "rupees" }],
    ["an empty name", { name: "  " }],
  ])("create rejects %s with 400", async (_label, payload) => {
    const app = setup();
    const { cookie } = await signUp(app, "a@example.com");

    const res = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie },
      payload,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("update rejects an empty body and a non-UUID id with 400", async () => {
    const app = setup();
    const { cookie } = await signUp(app, "a@example.com");

    const empty = await app.inject({
      method: "PATCH",
      url: `/accounts/${crypto.randomUUID()}`,
      headers: { cookie },
      payload: {},
    });
    const badId = await app.inject({
      method: "DELETE",
      url: "/accounts/not-a-uuid",
      headers: { cookie },
    });

    expect(empty.statusCode).toBe(400);
    expect(badId.statusCode).toBe(400);
    await app.close();
  });

  it("returns 404 when touching another user's account", async () => {
    const app = setup();
    const alice = await signUp(app, "alice@example.com");
    const bob = await signUp(app, "bob@example.com");
    const created = await app.inject({
      method: "POST",
      url: "/accounts",
      headers: { cookie: bob.cookie },
      payload: { name: "Bob account" },
    });
    const { id } = created.json().account;

    const patch = await app.inject({
      method: "PATCH",
      url: `/accounts/${id}`,
      headers: { cookie: alice.cookie },
      payload: { name: "Mine now" },
    });
    const del = await app.inject({
      method: "DELETE",
      url: `/accounts/${id}`,
      headers: { cookie: alice.cookie },
    });
    const list = await app.inject({
      method: "GET",
      url: "/accounts",
      headers: { cookie: alice.cookie },
    });

    expect(patch.statusCode).toBe(404);
    expect(del.statusCode).toBe(404);
    expect(list.json().accounts).toEqual([]);
    await app.close();
  });
});
