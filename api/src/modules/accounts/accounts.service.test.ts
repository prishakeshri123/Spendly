import { describe, expect, it } from "vitest";
import { AppError } from "../../utils/errors.js";
import { createFakeDb } from "../auth/auth.fake-db.js";
import { createAuthService } from "../auth/auth.service.js";
import { createAccountsService } from "./accounts.service.js";

async function setup() {
  const { accountRows, db } = createFakeDb();
  const auth = createAuthService(db);
  const alice = await auth.register({
    email: "alice@example.com",
    password: "correct-horse",
  });
  const bob = await auth.register({
    email: "bob@example.com",
    password: "correct-horse",
  });
  return { accountRows, service: createAccountsService(db), alice, bob };
}

describe("create", () => {
  it("defaults the currency to the user's and stores integer minor units", async () => {
    const { service, alice } = await setup();

    const account = await service.create(alice.id, {
      name: "Wallet",
      type: "WALLET",
      openingBalance: 12550,
    });

    expect(account).toMatchObject({
      name: "Wallet",
      type: "WALLET",
      currency: "INR",
      openingBalance: 12550,
      archivedAt: null,
    });
  });

  it("uses an explicit currency and allows duplicate names", async () => {
    const { service, alice } = await setup();

    const first = await service.create(alice.id, {
      name: "Cash",
      currency: "USD",
    });
    const second = await service.create(alice.id, { name: "Cash" });

    expect(first.currency).toBe("USD");
    expect(second.name).toBe("Cash");
    expect(await service.list(alice.id)).toHaveLength(2);
  });
});

describe("list", () => {
  it("only returns the user's own accounts", async () => {
    const { service, alice, bob } = await setup();
    await service.create(alice.id, { name: "Alice account" });
    await service.create(bob.id, { name: "Bob account" });

    const accounts = await service.list(alice.id);

    expect(accounts.map((a) => a.name)).toEqual(["Alice account"]);
  });

  it("hides archived accounts unless asked", async () => {
    const { service, alice } = await setup();
    const keep = await service.create(alice.id, { name: "Keep" });
    const old = await service.create(alice.id, { name: "Old" });
    await service.archive(alice.id, old.id);

    expect((await service.list(alice.id)).map((a) => a.id)).toEqual([keep.id]);
    expect(await service.list(alice.id, true)).toHaveLength(2);
  });
});

describe("update", () => {
  it("changes the given fields only and keeps the currency", async () => {
    const { service, alice } = await setup();
    const account = await service.create(alice.id, {
      name: "Bank",
      openingBalance: 500,
    });

    const updated = await service.update(alice.id, account.id, {
      name: "Savings",
    });

    expect(updated).toMatchObject({
      name: "Savings",
      currency: "INR",
      openingBalance: 500,
      type: "BANK",
    });
  });

  it("returns 404 for another user's account and leaves it untouched", async () => {
    const { service, alice, bob } = await setup();
    const account = await service.create(bob.id, { name: "Bob account" });

    await expect(
      service.update(alice.id, account.id, { name: "Hacked" }),
    ).rejects.toMatchObject({ statusCode: 404, code: "ACCOUNT_NOT_FOUND" });
    expect((await service.list(bob.id))[0]?.name).toBe("Bob account");
  });

  it("returns 404 for an archived account", async () => {
    const { service, alice } = await setup();
    const account = await service.create(alice.id, { name: "Old" });
    await service.archive(alice.id, account.id);

    await expect(
      service.update(alice.id, account.id, { name: "New" }),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe("archive", () => {
  it("soft deletes: the row stays with archivedAt set", async () => {
    const { service, accountRows, alice } = await setup();
    const account = await service.create(alice.id, { name: "Old" });

    await service.archive(alice.id, account.id);

    expect(accountRows).toHaveLength(1);
    expect(accountRows[0]?.archivedAt).toBeInstanceOf(Date);
  });

  it("is a no-op when already archived", async () => {
    const { service, accountRows, alice } = await setup();
    const account = await service.create(alice.id, { name: "Old" });
    await service.archive(alice.id, account.id);
    const firstArchivedAt = accountRows[0]?.archivedAt;

    await service.archive(alice.id, account.id);

    expect(accountRows[0]?.archivedAt).toBe(firstArchivedAt);
  });

  it("returns 404 for another user's account and does not archive it", async () => {
    const { service, accountRows, alice, bob } = await setup();
    const account = await service.create(bob.id, { name: "Bob account" });

    await expect(service.archive(alice.id, account.id)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(accountRows[0]?.archivedAt).toBeNull();
  });
});
