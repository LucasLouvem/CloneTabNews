import { NextApiRequest, NextApiResponse } from "next";
import MigrationRunner from "node-pg-migrate";
import { resolve } from "path";
import database from "infra/database";
import { Client } from "pg";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandler);

const ConfigMigrationRunner = {
  dir: resolve("infra", "migrations"),
  dryRun: true,
  direction: "up" as const,
  migrationsTable: "pgmigrations",
  verbose: false,
};

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  let dbClient: Client;
  try {
    dbClient = await database.getNewClient();
    const migrations = await MigrationRunner({
      ...ConfigMigrationRunner,
      dbClient,
    });
    return res.status(200).send(migrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();
    const migrations = await MigrationRunner({
      ...ConfigMigrationRunner,
      dbClient,
      dryRun: false,
    });

    if (migrations.length > 0) {
      return res.status(201).send(migrations);
    }

    return res.status(200).send(migrations);
  } finally {
    await dbClient.end();
  }
}
