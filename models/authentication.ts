import user from "models/user";
import { NotFoundError, UnauthorizedError } from "infra/errors";
import password from "models/password";

async function authenticateUser(
  providedEmail: string,
  providedPassword: string,
) {
  try {
    const userFound = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, userFound.password);
    return userFound;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Acesso não autorizado.",
        action: "Verifique os dados enviados novamente.",
      });
    }
    throw error;
  }
}

async function findUserByEmail(providedEmail: string) {
  let userFound;

  try {
    userFound = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Email não encontrado.",
        action: "Verifique os dados enviados novamente.",
      });
    }
    throw error;
  }

  return userFound;
}

async function validatePassword(
  providedPassword: string,
  storedPasswordHash: string,
) {
  const passwordsMatch = await password.compare(
    providedPassword,
    storedPasswordHash,
  );

  if (!passwordsMatch) {
    throw new UnauthorizedError({
      message: "Senha incorreta.",
      action: "Verifique os dados enviados novamente.",
    });
  }
  return passwordsMatch;
}

const authentication = {
  authenticateUser,
};

export default authentication;
