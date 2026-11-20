import database from "infra/database";
import crypto from "crypto";
import { UnauthorizedError } from "infra/errors";

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

    if (result.rows.length === 0) {
      throw new UnauthorizedError({
        message: "Id não encontrado.",
        action: "Verifique o id e tente novamente.",
      });
    }
    return result.rows[0];
  }
}

async function renew(sessionId: string) {
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MILLISECONDS);

  const renewedSession = await renewSession(sessionId, expiresAt);

  return renewedSession;

  async function renewSession(sessionId: string, expiresAt: Date) {
    const result = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [sessionId, expiresAt],
    });
    return result.rows[0];
  }
}

async function expiresSessionById(sessionId: string) {
  const expiredSession = await deleteSession(sessionId);

  return expiredSession;

  async function deleteSession(sessionId: string) {
    const result = await database.query({
      text: `
      UPDATE
        sessions
      SET
        expires_at = expires_at - interval '1 year',
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [sessionId],
    });
    return result.rows[0];
  }
}

const session = {
  create,
  renew,
  EXPIRES_IN_MILLISECONDS,
  expiresSessionById,
};

export default session;
