import database from "infra/database";
import crypto from "crypto";

const EXPIRES_IN_MILLISECONDS: number = 60 * 60 * 24 * 30 * 1000;

async function create(userId: string) {
  const token = crypto.randomBytes(48).toString("hex");

  const expiresAt = new Date(Date.now() + EXPIRES_IN_MILLISECONDS);

  const createdSession = await createNewSession(token, userId, expiresAt);

  return createdSession;

  async function createNewSession(
    token: string,
    userId: string,
    expiresAt: Date,
  ) {
    const result = await database.query({
      text: `
      INSERT INTO
        sessions (token, user_id, expires_at )
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [token, userId, expiresAt],
    });
    return result.rows[0];
  }
}

const session = {
  create,
  EXPIRES_IN_MILLISECONDS,
};

export default session;
