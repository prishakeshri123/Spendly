import type { PrismaClient } from "../../generated/prisma/client.js";
import { notFound, unauthorized } from "../../utils/errors.js";
import type {
  CreateAccountInput,
  PublicAccount,
  UpdateAccountInput,
} from "./accounts.schema.js";

const publicSelect = {
  id: true,
  name: true,
  type: true,
  currency: true,
  openingBalance: true,
  archivedAt: true,
  createdAt: true,
} as const;

const accountNotFound = () =>
  notFound("ACCOUNT_NOT_FOUND", "Account not found");

export function createAccountsService(
  db: Pick<PrismaClient, "user" | "account">,
) {
  async function getOwned(userId: string, id: string): Promise<PublicAccount> {
    const account = await db.account.findFirst({
      where: { id, userId },
      select: publicSelect,
    });
    if (!account) throw accountNotFound();
    return account;
  }

  return {
    list(userId: string, includeArchived = false): Promise<PublicAccount[]> {
      return db.account.findMany({
        where: { userId, ...(includeArchived ? {} : { archivedAt: null }) },
        orderBy: { createdAt: "asc" },
        select: publicSelect,
      });
    },

    async create(
      userId: string,
      input: CreateAccountInput,
    ): Promise<PublicAccount> {
      let currency = input.currency;
      if (!currency) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { currency: true },
        });
        if (!user) throw unauthorized();
        currency = user.currency;
      }
      return db.account.create({
        data: { ...input, currency, userId },
        select: publicSelect,
      });
    },

    // Archived accounts are read-only, so they count as not found here.
    async update(
      userId: string,
      id: string,
      input: UpdateAccountInput,
    ): Promise<PublicAccount> {
      const { count } = await db.account.updateMany({
        where: { id, userId, archivedAt: null },
        data: input,
      });
      if (count === 0) throw accountNotFound();
      return getOwned(userId, id);
    },

    // Soft delete so transaction history stays valid. Archiving twice is a no-op.
    async archive(userId: string, id: string): Promise<void> {
      const { count } = await db.account.updateMany({
        where: { id, userId, archivedAt: null },
        data: { archivedAt: new Date() },
      });
      if (count === 0) await getOwned(userId, id);
    },
  };
}

export type AccountsService = ReturnType<typeof createAccountsService>;
