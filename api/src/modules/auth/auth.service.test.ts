import { describe, expect, it } from "vitest";
import { AppError } from "../../utils/errors.js";
import { createFakeDb } from "./auth.fake-db.js";
import { createAuthService } from "./auth.service.js";

function setup() {
  const { rows, db } = createFakeDb();
  return { rows, service: createAuthService(db) };
}

const credentials = { email: "a@example.com", password: "correct-horse" };

describe("register", () => {
  it("creates a user, hashes the password and returns no hash", async () => {
    const { rows, service } = setup();

    const user = await service.register({ ...credentials, name: "Asha" });

    expect(user).toEqual({
      id: "user-1",
      email: "a@example.com",
      name: "Asha",
      currency: "INR",
    });
    expect(user).not.toHaveProperty("passwordHash");
    expect(rows[0]?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(rows[0]?.passwordHash).not.toContain(credentials.password);
  });

  it("rejects a duplicate email with 409", async () => {
    const { service } = setup();
    await service.register(credentials);

    await expect(service.register(credentials)).rejects.toMatchObject({
      statusCode: 409,
      code: "EMAIL_TAKEN",
    });
  });
});

describe("login", () => {
  it("returns the user for correct credentials without the hash", async () => {
    const { service } = setup();
    await service.register(credentials);

    const user = await service.login(credentials);

    expect(user.email).toBe("a@example.com");
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password with 401", async () => {
    const { service } = setup();
    await service.register(credentials);

    await expect(
      service.login({ ...credentials, password: "wrong-password" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects an unknown email with the same 401", async () => {
    const { service } = setup();

    const err = await service.login(credentials).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    });
  });
});

describe("getMe", () => {
  it("returns the user for a known id", async () => {
    const { service } = setup();
    const created = await service.register(credentials);

    await expect(service.getMe(created.id)).resolves.toEqual(created);
  });

  it("rejects an unknown id with 401", async () => {
    const { service } = setup();

    await expect(service.getMe("missing")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
