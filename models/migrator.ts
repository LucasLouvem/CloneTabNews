import { resolve } from "path";
import { Client } from "pg";
import database from "infra/database";
import runMigrations from "node-pg-migrate";

const migrationRunnerOptions = {
  dir: resolve("infra", "migrations"),
  dryRun: true,
  direction: "up" as const,
  migrationsTable: "pgmigrations",
  log: () => {},
};

let dbClient: Client | undefined;

async function listPendingMigrations() {
  try {
    dbClient = await database.getNewClient();
    const migrations = await runMigrations({
      ...migrationRunnerOptions,
      dbClient,
    });

    return migrations;
  } finally {
    await dbClient?.end();
  }
}

async function runningPendingMigrations() {
  try {
    dbClient = await database.getNewClient();
    const migrations = await runMigrations({
      ...migrationRunnerOptions,
      dbClient,
      dryRun: false,
    });

    return migrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runningPendingMigrations,
};

export default migrator;
