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

  const versionQueryResult = await database.query("SHOW server_version;");
  const serverVersion = versionQueryResult.rows[0].server_version;

  const maxConnectionsQueryResult = await database.query(
    "SHOW max_connections;",
  );
  const maxConnectionsValue = maxConnectionsQueryResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const openedConnectionsQueryResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const openedConnectionsCount = openedConnectionsQueryResult.rows[0].count;

  return res.status(200).send({
    updated_at: updatedAt,
    dependencies: {
      version: serverVersion,
      max_connections: parseInt(maxConnectionsValue),
      opened_connections: openedConnectionsCount,
    },
  });
}
