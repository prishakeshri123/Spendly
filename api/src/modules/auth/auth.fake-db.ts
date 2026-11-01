import type { PrismaClient } from "../../generated/prisma/client.js";
import { createFakeAccountTable } from "../accounts/accounts.fake-db.js";

interface Row {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  currency: string;
}

// Minimal in-memory stand-in for prisma.user, honouring `select` and the email unique key.
export function createFakeDb() {
  const rows: Row[] = [];
  let seq = 0;

  const pick = (row: Row, select?: Record<string, boolean>) =>
    select
      ? (Object.fromEntries(
          Object.keys(select)
            .filter((k) => select[k])
            .map((k) => [k, row[k as keyof Row]]),
        ) as Partial<Row>)
      : row;

  const user = {
    findUnique: async ({
      where,
      select,
    }: {
      where: { id?: string; email?: string };
      select?: Record<string, boolean>;
    }) => {
      const row = rows.find((r) =>
        where.id !== undefined ? r.id === where.id : r.email === where.email,
      );
      return row ? pick(row, select) : null;
    },
    create: async ({
      data,
      select,
    }: {
      data: { email: string; passwordHash: string; name?: string };
      select?: Record<string, boolean>;
    }) => {
      if (rows.some((r) => r.email === data.email)) {
        throw Object.assign(new Error("Unique constraint failed"), {
          code: "P2002",
        });
      }
      const row: Row = {
        id: `user-${++seq}`,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name ?? null,
        currency: "INR",
      };
      rows.push(row);
      return pick(row, select);
    },
  };

  const accounts = createFakeAccountTable();

  return {
    rows,
    accountRows: accounts.rows,
    db: { user, account: accounts.account } as unknown as Pick<
      PrismaClient,
      "user" | "account"
    >,
  };
}
