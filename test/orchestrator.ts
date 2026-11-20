import database from "infra/database";
import retry from "async-retry";
import migrator from "models/migrator";
import user from "models/user";
import { faker } from "@faker-js/faker";
import session from "models/session";

type CreateUserOptions = {
  username?: string;
  email?: string;
  password?: string;
};

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

async function createUser(userOverrides: CreateUserOptions) {
  return await user.create({
    username:
      userOverrides.username || faker.internet.username().replace(/[.-_]/, ""),
    email: userOverrides.email || faker.internet.email(),
    password: userOverrides.password || faker.internet.password(),
  });
}

async function createSession(userId: string) {
  return await session.create(userId);
}

async function runPendingMigrations() {
  await migrator.runningPendingMigrations();
}

const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations,
  createUser,
  createSession,
};

export default orchestrator;
