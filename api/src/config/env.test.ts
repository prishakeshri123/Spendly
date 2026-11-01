import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

const valid = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/budget_planner",
  JWT_SECRET: "a-secret-that-is-at-least-32-characters",
};

describe("loadEnv", () => {
  it("applies defaults for optional values", () => {
    const env = loadEnv(valid);

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGIN).toBe("http://localhost:3000");
  });

  it("coerces PORT to a number", () => {
    expect(loadEnv({ ...valid, PORT: "5000" }).PORT).toBe(5000);
  });

  it("rejects a short JWT_SECRET", () => {
    expect(() => loadEnv({ ...valid, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
  });

  it("rejects a missing DATABASE_URL", () => {
    expect(() => loadEnv({ JWT_SECRET: valid.JWT_SECRET })).toThrow(/DATABASE_URL/);
  });
});
