import bcryptjs from "bcryptjs";

async function hash(password: string) {
  const saltRounds = process.env.NODE_ENV === "production" ? 14 : 1;
  return await bcryptjs.hash(password, saltRounds);
}

async function compare(providedPassword: string, storedPasswordHash: string) {
  return await bcryptjs.compare(providedPassword, storedPasswordHash);
}

const password = {
  hash,
  compare,
};

export default password;
