import database from "infra/database";
import password from "models/password";
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

async function findOneByEmail(email: string) {
  const findUser = await database.query<User>({
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

  if (findUser.rows.length === 0) {
    throw new NotFoundError({
      message: "Email não encontrado.",
      action: "Verifique o Email e tente novamente.",
    });
  }

  return findUser.rows[0];
}

async function create(userInputValues: UserInputValues): Promise<User> {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await passwordHashObject(userInputValues);

  const newUser = runInsertQuery(userInputValues);
  return newUser;

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
  const findUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await passwordHashObject(userInputValues);
  }
  const userWithValues = { ...findUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithValues);
  return updatedUser;

  async function runUpdateQuery(userWithValues: User) {
    const updatedQuery = await database.query<User>({
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
        userWithValues.id,
        userWithValues.username,
        userWithValues.email,
        userWithValues.password,
      ],
    });
    return updatedQuery.rows[0];
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
  const userPassword = userInputValues.password;
  const hashedPassword = await password.hash(userPassword);
  return (userInputValues.password = hashedPassword);
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
