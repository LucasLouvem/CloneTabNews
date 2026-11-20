import { NextApiRequest, NextApiResponse } from "next";
import session from "models/session";
import * as cookie from "cookie";
import {
  MethodNotAllowed,
  InternalServerError,
  ServiceError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

async function OnNoMatchHandler(req: NextApiRequest, res: NextApiResponse) {
  const publicError = new MethodNotAllowed();

  return res.status(publicError.statusCode).json(publicError);
}

async function OnErrorHandler(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(error.statusCode).send(error);
  }

  const publicError = new InternalServerError({
    statusCode: error instanceof ServiceError ? error.statusCode : undefined,
    cause: error,
  });
  console.error(error);
  return res.status(publicError.statusCode).json(publicError);
}

async function defineCookie(token: string, res: NextApiResponse) {
  const sessionCookie = cookie.serialize("session_id", token, {
    path: "/",
    httpOnly: true,
    maxAge: session.EXPIRES_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
  });

  res.setHeader("Set-Cookie", sessionCookie);
}
async function expireCookie(res: NextApiResponse) {
  const expiredSessionCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    httpOnly: true,
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
  });

  res.setHeader("Set-Cookie", expiredSessionCookie);
}

const controller = {
  errorHandler: {
    onNoMatch: OnNoMatchHandler,
    onError: OnErrorHandler,
  },
  defineCookie,
  expireCookie,
};

export default controller;
