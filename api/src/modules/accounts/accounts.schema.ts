import { z } from "zod";

const INT32_MAX = 2_147_483_647;

const accountType = z.enum(["CASH", "BANK", "CARD", "WALLET", "OTHER"]);
const name = z.string().trim().min(1).max(100);
const currency = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(z.string().regex(/^[A-Z]{3}$/, "Expected a 3-letter currency code"));
// Integer minor units (paise/cents); negative is allowed, e.g. a card with a balance owed.
const openingBalance = z.number().int().min(-INT32_MAX).max(INT32_MAX);

// Currency is fixed at creation: changing it would corrupt transaction history.

export const createAccountBody = z.object({
  name,
  type: accountType.optional(),
  currency: currency.optional(),
  openingBalance: openingBalance.optional(),
});

export const updateAccountBody = z
  .object({
    name,
    type: accountType,
    openingBalance,
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field to update",
  });

export const accountParams = z.object({ id: z.uuid() });

export const listAccountsQuery = z.object({
  includeArchived: z.enum(["true", "false"]).default("false"),
});

export type CreateAccountInput = z.infer<typeof createAccountBody>;
export type UpdateAccountInput = z.infer<typeof updateAccountBody>;

export interface PublicAccount {
  id: string;
  name: string;
  type: z.infer<typeof accountType>;
  currency: string;
  openingBalance: number;
  archivedAt: Date | null;
  createdAt: Date;
}
