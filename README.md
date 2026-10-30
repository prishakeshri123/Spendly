# Budget Planner

Plan and track expenses with category budgets and reports. See `CLAUDE.md` for the stack and conventions.

## Layout

- `web/` — Next.js app (TypeScript, Tailwind)
- `api/` — Fastify API (TypeScript)

## Running locally

Requires Node 20+ and Docker.

```bash
# database (PostgreSQL 16 on localhost:5433)
docker compose up -d

# api (http://localhost:4000)
cd api
cp .env.example .env
npm install
npx prisma migrate dev   # creates the tables
npm run dev

# web (http://localhost:3000)
cd web
npm install
npm run dev
```
