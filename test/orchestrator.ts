import database from "infra/database";
import retry from "async-retry";
import { error } from "console";

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
          throw new error(`Servidor indisponível: HTTP ${response.status}`);
        }
      },
      {
        retries: 100,
        maxTimeout: 1000,
      }
    );
  }
}

const orchestrator = {
  clearDatabase,
  waitForAllServices,
};

export default orchestrator;
