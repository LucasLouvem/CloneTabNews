import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const username = req.query.username;
  if (typeof username !== "string") {
    return res.status(400).json({ message: "Nome de usuário inválido." });
  }
  const result = await user.findOneByUsername(username);

  return res.status(200).send(result);
}
