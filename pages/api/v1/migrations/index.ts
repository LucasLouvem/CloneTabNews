import { NextApiRequest, NextApiResponse } from "next";
import MigrationRunner from "node-pg-migrate";
import { join } from "path";

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const methodAlloweds: string[] = ["GET", "POST"];

  if (methodAlloweds.includes(req.method)) {
    const migrations = await MigrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dir: join("infra", "migrations"),
      dryRun: req.method === "GET" ? true : false,
      direction: "up",
      migrationsTable: "pgmigrations",
      verbose: false,
    });

    if (migrations.length > 0 && req.method == "POST") {
      return res.status(201).send(migrations);
    }

    return res.status(200).send(migrations);
  }

  return res.status(405).send([]);
}
