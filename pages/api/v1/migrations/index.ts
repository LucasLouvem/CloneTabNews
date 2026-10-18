import { NextApiRequest, NextApiResponse } from "next";
import MigrationRunner from "node-pg-migrate";
import { join } from "path";
import database from "infra/database";
import { Client } from "pg";

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const methodAlloweds: string[] = ["GET", "POST"];

  if (!methodAlloweds.includes(req.method)) {
    return res.status(405).send({
      error: "MethodNotAllowed",
    });
  }
  let dbClient: Client;
  try {
    if (methodAlloweds.includes(req.method)) {
      dbClient = await database.getNewClient();
      const migrations = await MigrationRunner({
        dbClient: dbClient,
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
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await dbClient.end();
  }
}
