import argon2 from "argon2";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError, unauthorized } from "../../utils/errors.js";
import type { LoginInput, PublicUser, RegisterInput } from "./auth.schema.js";

const publicSelect = {
  id: true,
  email: true,
  name: true,
  currency: true,
} as const;

// Verified against when the email is unknown, so timing doesn't reveal which emails exist.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= argon2.hash("not-a-real-password"));

const emailTaken = () =>
  new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");

export function createAuthService(db: Pick<PrismaClient, "user">) {
  return {
    async register(input: RegisterInput): Promise<PublicUser> {
      const existing = await db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existing) throw emailTaken();

      const passwordHash = await argon2.hash(input.password);
      try {
        return await db.user.create({
          data: { email: input.email, passwordHash, name: input.name },
          select: publicSelect,
        });
      } catch (err) {
        // Lost a race with a concurrent register for the same email.
        if ((err as { code?: string }).code === "P2002") throw emailTaken();
        throw err;
      }
    },

    async login(input: LoginInput): Promise<PublicUser> {
      const user = await db.user.findUnique({
        where: { email: input.email },
        select: { ...publicSelect, passwordHash: true },
      });
      const valid = await argon2.verify(
        user?.passwordHash ?? (await getDummyHash()),
        input.password,
      );
      if (!user || !valid) {
        throw unauthorized("Invalid email or password");
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
      };
    },

    async getMe(userId: string): Promise<PublicUser> {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: publicSelect,
      });
      if (!user) throw unauthorized();
      return user;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
