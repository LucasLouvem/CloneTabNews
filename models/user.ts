import database from "infra/database";
import password from "models/password";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

export interface UserInputValues {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

async function findOneById(id: string) {
  const queryResult = await database.query<User>({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        id = $1
      ;`,
    values: [id],
  });

  if (queryResult.rows.length === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado para o ID informado.",
      action: "Verifique o ID do usuário e tente novamente.",
    });
  }

  return queryResult.rows[0];
}

async function findOneByUsername(username: string) {
  const queryResult = await database.query<User>({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  });

  if (queryResult.rows.length === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o nome de usuário e tente novamente.",
    });
  }

  return queryResult.rows[0];
}

async function findOneByEmail(email: string) {
  const queryResult = await database.query<User>({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (queryResult.rows.length === 0) {
    throw new NotFoundError({
      message: "Email não encontrado.",
      action: "Verifique o Email e tente novamente.",
    });
  }

  return queryResult.rows[0];
}

async function findOneValidByToken(sessionToken: string) {
  const validSession = await runSelectQuery(sessionToken);
  return validSession;

  async function runSelectQuery(sessionToken: string) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1
      ;`,
      values: [sessionToken],
    });

    if (results.rows.length === 0) {
      throw new UnauthorizedError({
        message: "Sessão inválida ou expirada.",
        action: "Faça login novamente para acessar este recurso.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues: UserInputValues): Promise<User> {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await passwordHashObject(userInputValues);

  const createdUser = runInsertQuery(userInputValues);
  return createdUser;

  async function runInsertQuery(userInputValues: UserInputValues) {
    const insertResult = await database.query<User>({
      text: `
      INSERT INTO
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return insertResult.rows[0];
  }
}

async function update(username: string, userInputValues: UserInputValues) {
  const existingUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await passwordHashObject(userInputValues);
  }
  const userWithUpdates = { ...existingUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithUpdates);
  return updatedUser;

  async function runUpdateQuery(userWithUpdates: User) {
    const updateResult = await database.query<User>({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc',now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [
        userWithUpdates.id,
        userWithUpdates.username,
        userWithUpdates.email,
        userWithUpdates.password,
      ],
    });
    return updateResult.rows[0];
  }
}

async function validateUniqueEmail(email: string) {
  const result = await database.query<Pick<User, "email">>({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if ((result.rowCount ?? 0) > 0) {
    throw new ValidationError({
      message: "Não foi possível realizar esta operação.",
      action: "Revise os dados e tente novamente.",
    });
  }
  return result.rows;
}

async function validateUniqueUsername(username: string) {
  const result = await database.query<Pick<User, "username">>({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "Não foi possível realizar esta operação.",
      action: "Revise os dados e tente novamente.",
    });
  }
  return result;
}

async function passwordHashObject(userInputValues: UserInputValues) {
  const plainTextPassword = userInputValues.password;
  const hashedPassword = await password.hash(plainTextPassword);
  return (userInputValues.password = hashedPassword);
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  findOneValidByToken,
  findOneById,
  update,
};

export default user;
