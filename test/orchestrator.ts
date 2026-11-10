import database from "infra/database";
import retry from "async-retry";
import migrator from "models/migrator";

async function clearDatabase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(
      async () => {
        const response = await fetch("http://localhost:3000/api/v1/status");

        if (response.status != 200) {
          throw new Error(`Servidor indisponível: HTTP ${response.status}`);
        }
      },
      {
        retries: 100,
        maxTimeout: 1000,
      },
    );
  }
}

async function runPendingMigrations() {
  await migrator.runningPendingMigrations();
}

const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations,
};

export default orchestrator;
