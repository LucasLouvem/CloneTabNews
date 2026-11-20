import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import session from "models/session";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandler);

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies.session_id;

  if (typeof sessionToken !== "string") {
    return res
      .status(401)
      .json({ message: "Cookie de sessão ausente ou inválido." });
  }

  const validSession = await user.findOneValidByToken(sessionToken);

  await session.renew(validSession.id);

  controller.defineCookie(validSession.token, res);

  const authenticatedUser = await user.findOneById(validSession.user_id);

  res.setHeader(
    "Cache-Control",
    "no-stored,no-cache,max-age=0,must-revalidate",
  );

  return res.status(200).json(authenticatedUser);
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const sessionToken = req.cookies.session_id;

  if (typeof sessionToken !== "string") {
    return res
      .status(401)
      .json({ message: "Cookie de sessão ausente ou inválido." });
  }

  const validSession = await user.findOneValidByToken(sessionToken);

  const expiredSession = await session.expiresSessionById(validSession.id);

  controller.expireCookie(res);

  res.status(200).json(expiredSession);
}
