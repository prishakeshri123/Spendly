import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const registerBody = z.object({
  email,
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(100).optional(),
});

export const loginBody = z.object({
  email,
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerBody>;
export type LoginInput = z.infer<typeof loginBody>;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  currency: string;
}
