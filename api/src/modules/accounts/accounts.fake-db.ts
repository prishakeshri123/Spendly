export interface AccountRow {
  id: string;
  userId: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
  archivedAt: Date | null;
  createdAt: Date;
}

interface Where {
  id?: string;
  userId?: string;
  archivedAt?: null;
}

// Minimal in-memory stand-in for prisma.account; `select` is ignored (rows hold only public fields plus userId).
export function createFakeAccountTable() {
  const rows: AccountRow[] = [];
  let seq = 0;

  const matches = (row: AccountRow, where: Where) =>
    (where.id === undefined || row.id === where.id) &&
    (where.userId === undefined || row.userId === where.userId) &&
    (where.archivedAt === undefined || row.archivedAt === where.archivedAt);

  const strip = (row: AccountRow) => {
    const { userId, ...rest } = row;
    void userId;
    return rest;
  };

  const account = {
    findFirst: async ({ where }: { where: Where }) => {
      const row = rows.find((r) => matches(r, where));
      return row ? strip(row) : null;
    },
    findMany: async ({ where }: { where: Where }) =>
      rows.filter((r) => matches(r, where)).map(strip),
    create: async ({
      data,
    }: {
      data: Partial<AccountRow> &
        Pick<AccountRow, "userId" | "name" | "currency">;
    }) => {
      const row: AccountRow = {
        id: crypto.randomUUID(),
        type: "BANK",
        openingBalance: 0,
        archivedAt: null,
        createdAt: new Date(++seq),
        ...data,
      };
      rows.push(row);
      return strip(row);
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Where;
      data: Partial<AccountRow>;
    }) => {
      const hits = rows.filter((r) => matches(r, where));
      hits.forEach((r) => Object.assign(r, data));
      return { count: hits.length };
    },
  };

  return { rows, account };
}
