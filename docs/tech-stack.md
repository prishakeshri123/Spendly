# Tech stack and repository layout

## Decided

- Frontend: Next.js (React) + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- Backend: Node.js + Fastify + TypeScript
- Database: PostgreSQL, run locally with `docker compose up -d` (host port 5433)
- ORM: Prisma 7 (`api/prisma/schema.prisma`, config in `api/prisma.config.ts`, client generated to `api/src/generated/prisma`)
- Auth: `@fastify/jwt` with an httpOnly cookie (`@fastify/cookie`), passwords hashed with `argon2` (pinned to 0.41.x: 0.45's prebuilt binary crashed on Windows/Node 20)
- Security: `@fastify/cors`, `@fastify/rate-limit`
- Validation: Zod, parsed in route handlers (`schema.parse`); errors map to 400 in `utils/errors.ts`

## Proposed (confirm before relying on them)

- API docs: `@fastify/swagger`
- Security: `@fastify/helmet`
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
