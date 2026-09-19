import { NextApiRequest, NextApiResponse } from "next";
import { query } from "infra/database";

type StatusResponse = {
  status: string;
};

export default async function status(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  const test = await query("SELECT 1 + 1;");
  console.log(test.rows);
  return res.status(200).send({
    status: "ok",
  });
}
