import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5433/budget_planner",
      JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
    },
  },
});
