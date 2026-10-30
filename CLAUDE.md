# Budget Planner

A web app to plan and track expenses with category budgets, reports and a "safe to spend today" number. Long-term goal: fetch each user's spending automatically and sort it by category. Reference product: BudgetBakers Wallet (https://web.budgetbakers.com/).

Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Recharts (`web/`), Fastify + TypeScript (`api/`), PostgreSQL.

## Reference docs (read when relevant)

- [docs/tech-stack.md](docs/tech-stack.md): stack decisions, proposed libraries, repo layout, module structure
- [docs/ui-direction.md](docs/ui-direction.md): neumorphism style and accessibility rules (read before any UI work)
- [docs/roadmap.md](docs/roadmap.md): planned features and build order

## Data model

Tables: User, Account, Category, Transaction, Budget.

- Every table except User carries `userId`, and **every query must filter by `userId`**.
- Budgets are stored per month (`"2026-10"`) with a unique key on user + category + month.
- Prefer soft deletes (archive) for accounts and categories so history stays valid.

## Money rules

- Never use floating-point numbers for money.
- Store amounts as integer minor units (cents/paise) or Postgres `NUMERIC`. Pick one and use it everywhere.
- Store the currency code alongside amounts. Convert to a display value only at the API response or UI layer.
- Wrap multi-step changes (such as account transfers) in a database transaction.

## Conventions

- TypeScript strict mode everywhere.
- Each backend module has `*.routes.ts`, `*.schema.ts`, `*.service.ts`; keep logic in services.
- Validate every request body, query and param with a schema.
- Never log or return password hashes or tokens.
- Test services with Vitest; test routes with Fastify's `inject`.
- Keep commits small and focused.

## Commands

```bash
# api
npm run dev        # start Fastify in watch mode
npm run build
npx prisma migrate dev

# web
npm run dev        # start Next.js
```
