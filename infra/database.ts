import { Client } from "pg";

async function query(databaseQuery) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(databaseQuery);
    return result;
  } catch (error) {
    console.error(error); // TODO Implementar Error Customizado
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();

  return client;
}

const database = {
  query,
};

export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV == "production" ? true : false;
}
