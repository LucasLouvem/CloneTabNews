import { Client } from "pg";

export async function query(databaseQuery) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(databaseQuery);
    return result;
  } catch (error) {
    console.log("error"); // TODO Implementar Error Customizado
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = await new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();

  return client;
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV == "production" ? true : false;
}
