import type { FastifyInstance } from "fastify";
import {
  accountParams,
  createAccountBody,
  listAccountsQuery,
  updateAccountBody,
} from "./accounts.schema.js";
import type { AccountsService } from "./accounts.service.js";

export interface AccountsRoutesOptions {
  service: AccountsService;
}

export async function accountsRoutes(
  app: FastifyInstance,
  { service }: AccountsRoutesOptions,
) {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) => {
    const { includeArchived } = listAccountsQuery.parse(request.query);
    return {
      accounts: await service.list(
        request.user.sub,
        includeArchived === "true",
      ),
    };
  });

  app.post("/", async (request, reply) => {
    const account = await service.create(
      request.user.sub,
      createAccountBody.parse(request.body),
    );
    return reply.status(201).send({ account });
  });

  app.patch("/:id", async (request) => {
    const { id } = accountParams.parse(request.params);
    const account = await service.update(
      request.user.sub,
      id,
      updateAccountBody.parse(request.body),
    );
    return { account };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = accountParams.parse(request.params);
    await service.archive(request.user.sub, id);
    return reply.status(204).send();
  });
}
