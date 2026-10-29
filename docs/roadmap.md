# Roadmap

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
