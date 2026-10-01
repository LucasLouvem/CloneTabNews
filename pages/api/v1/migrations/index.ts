import { NextApiRequest, NextApiResponse } from "next";
import MigrationRunner from "node-pg-migrate";
import { join } from "path";

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const migrations = await MigrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dir: join("infra", "migrations"),
    dryRun: true,
    direction: "up",
    migrationsTable: "pgmigrations",
    verbose: false,
  });

  return res.status(200).send(migrations);
}
