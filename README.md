# Budget Planner

Plan and track expenses with category budgets and reports. See `CLAUDE.md` for the stack and conventions.

## Layout

- `web/` — Next.js app (TypeScript, Tailwind)
- `api/` — Fastify API (TypeScript)

## Running locally

Requires Node 20+.

```bash
# api (http://localhost:4000)
cd api
npm install
npm run dev

# web (http://localhost:3000)
cd web
npm install
npm run dev
```
