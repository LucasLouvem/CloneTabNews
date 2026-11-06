import { NextApiRequest, NextApiResponse } from "next";
import database from "infra/database";
import { createRouter } from "next-connect";
import controller from "infra/controller";

type StatusResponse = {
  updated_at: string;
  dependencies: {
    version: string;
    max_connections: number;
    opened_connections: number;
  };
};

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandler);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>,
) {
  const updatedAt = new Date().toISOString();

  const dbVersion = await database.query("SHOW server_version;");
  const serverVersion = dbVersion.rows[0].server_version;

  const maxConnections = await database.query("SHOW max_connections;");
  const maxUsageConnections = maxConnections.rows[0].max_connections;

  const databasedb = process.env.POSTGRES_DB;
  const usageConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databasedb],
  });
  const usageConnection = usageConnections.rows[0].count;

  return res.status(200).send({
    updated_at: updatedAt,
    dependencies: {
      version: serverVersion,
      max_connections: parseInt(maxUsageConnections),
      opened_connections: usageConnection,
    },
  });
}
