import { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import * as cookie from "cookie";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const credentials = req.body;

  const authenticatedUser = await authentication.authenticateUser(
    credentials.email,
    credentials.password,
  );

  const createdSession = await session.create(authenticatedUser.id);

  const sessionCookie = cookie.serialize("session_id", createdSession.token, {
    path: "/",
    httpOnly: true,
    maxAge: session.EXPIRES_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
  });

  res.setHeader("Set-Cookie", sessionCookie);

  return res.status(201).send(createdSession);
}
