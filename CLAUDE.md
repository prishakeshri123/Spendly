# Budget Planner

A web app that helps users plan and track their expenses with category budgets, reports and a "safe to spend today" number. The long-term goal is to fetch each user's spending automatically and sort it by category. Reference product: BudgetBakers Wallet (https://web.budgetbakers.com/).

## Tech stack

**Decided**

- Frontend: Next.js (React) + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- Backend: Node.js + Fastify + TypeScript
- Database: PostgreSQL

**Proposed (confirm before relying on them)**

- ORM: Prisma
- Validation: Zod via `fastify-type-provider-zod`
- Auth: `@fastify/jwt` with an httpOnly cookie, passwords hashed with `argon2`
- API docs: `@fastify/swagger`
- Security: `@fastify/helmet`, `@fastify/cors`, `@fastify/rate-limit`
- Later: Redis + BullMQ for recurring bills and alerts

## Repository layout

```
budget-planner/
├── web/                 # Next.js app
└── api/                 # Fastify app
    ├── prisma/schema.prisma
    └── src/
        ├── app.ts        # builds the Fastify instance, registers plugins
        ├── server.ts     # starts the server
        ├── config/env.ts # validated environment variables
        ├── plugins/      # prisma, jwt auth, swagger, cors, helmet
        ├── modules/      # auth, accounts, categories, transactions, budgets, reports
        └── utils/        # money helpers, errors, pagination
```

Each backend module has `*.routes.ts` (HTTP), `*.schema.ts` (Zod) and `*.service.ts` (business logic). Keep logic in services, not route handlers.

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

## UI direction

- Style: **neumorphism** (soft raised/inset surfaces) on a bento-style dashboard grid.
- Light and dark themes, each with its own shadow colors, defined as CSS variables.
- Three shadow states only: raised (cards, buttons), inset (inputs, progress tracks, selected items), flat (minor items).
- Accessibility rules, which override the style when they conflict:
  - Text contrast at least 4.5:1.
  - Never rely on shadows alone to show something is clickable; use labels, icons and a visible focus ring.
  - Budget status colors (green/amber/red) are always paired with text such as "Over by $12".
  - The primary "Add transaction" button uses a solid accent fill.
  - Keep tables and transaction lists flat, with thin dividers.
- Charts: Recharts, themed with the same palette.

## Planned features

- Core: accounts, categories, transactions, category budgets, monthly dashboard, reports, CSV import/export.
- V2: recurring bills, savings goals, alerts at 80% of a budget, "safe to spend today", insights.
- V3: bank sync (automatic category-wise spend fetching), shared budgets, natural-language entry, what-if simulator.

## Build order

1. Project setup, env validation, database connection, health route
2. Auth (register, login, `me`)
3. Accounts and categories (seed default categories on signup)
4. Transactions CRUD with filters and pagination
5. Budgets and summary / by-category reports
6. Swagger docs, tests, rate limiting, deployment

## Conventions

- TypeScript strict mode everywhere.
- Validate every request body, query and param with a schema.
- Never log or return password hashes or tokens.
- Test services with Vitest; test routes with Fastify's `inject`.
- Keep commits small and focused.

## Commands (fill in as the project is created)

```bash
# api
npm run dev        # start Fastify in watch mode
npm run build
npx prisma migrate dev

# web
npm run dev        # start Next.js
```
