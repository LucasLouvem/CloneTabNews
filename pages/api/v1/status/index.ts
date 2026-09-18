import { NextApiRequest, NextApiResponse } from "next";

type StatusResponse = {
  status: string;
};

export default function status(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  return res.status(200).send({
    status: "ok",
  });
}
