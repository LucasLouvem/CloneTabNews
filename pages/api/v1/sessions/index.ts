import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;

  const authUser = await authentication.authenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  const createdSession = await session.create(authUser.id);

  return res.status(201).send(createdSession);
}
