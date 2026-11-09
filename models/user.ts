import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors";

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

async function findOneByUsername(username: string) {
  const findUser = await database.query<User>({
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

  if (findUser.rows.length === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o nome de usuário e tente novamente.",
    });
  }

  return findUser.rows[0];
}

async function create(userInputValues: UserInputValues): Promise<User> {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = runInsertQuery(userInputValues);
  return newUser;

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
        message: "Não foi possível criar a conta com os dados informados.",
        action: "Revise os dados ou tente recuperar o acesso à sua conta.",
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
        message: "Não foi possível criar a conta com os dados informados.",
        action: "Revise os dados ou tente recuperar o acesso à sua conta.",
      });
    }
    return result;
  }

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

const user = {
  create,
  findOneByUsername,
};

export default user;
