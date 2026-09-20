import { NextApiRequest, NextApiResponse } from "next";
import { query } from "infra/database";

type StatusResponse = {
  updated_at: string;
  db_version: string;
  usage_connections: number;
  max_connections: number;
};

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  const updatedAt = new Date().toISOString();

  const maxConnections = await query("SHOW max_connections");
  const maxUsageConnections = maxConnections.rows[0].max_connections;

  const usageConnections = await query(
    "SELECT count(*)::int AS opened_connections FROM pg_stat_activity WHERE datname = 'local_db'"
  );
  const usageConnection = usageConnections.rows[0].opened_connections;

  const dbVersion = await query("SHOW server_version");
  const serverVersion = dbVersion.rows[0].server_version;

  return res.status(200).send({
    updated_at: updatedAt,
    usage_connections: usageConnection,
    max_connections: parseInt(maxUsageConnections),
    db_version: serverVersion,
  });
}
