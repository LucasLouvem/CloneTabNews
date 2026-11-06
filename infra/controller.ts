import { NextApiRequest, NextApiResponse } from "next";
import {
  MethodNotAllowed,
  InternalServerError,
  ServiceError,
} from "infra/errors";

async function OnNoMatchHandler(req: NextApiRequest, res: NextApiResponse) {
  const PublicErrorObject = new MethodNotAllowed();

  return res.status(PublicErrorObject.statusCode).json(PublicErrorObject);
}

async function OnErrorHandler(
  err: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const PublicErrorObject = new InternalServerError({
    statusCode: err instanceof ServiceError ? err.statusCode : undefined,
    cause: err,
  });
  console.error(err);
  return res.status(PublicErrorObject.statusCode).json(PublicErrorObject);
}

const controller = {
  errorHandler: {
    onNoMatch: OnNoMatchHandler,
    onError: OnErrorHandler,
  },
};

export default controller;
