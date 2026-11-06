import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const migrations = await migrator.listPendingMigrations();
  return res.status(200).send(migrations);
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const migrations = await migrator.runningPendingMigrations();

  if (migrations.length > 0) {
    return res.status(201).send(migrations);
  }

  return res.status(200).send(migrations);
}
