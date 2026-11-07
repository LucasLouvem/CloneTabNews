import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(201).send({});
}
