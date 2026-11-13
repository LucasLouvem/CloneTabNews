import bcryptjs from "bcryptjs";

async function hash(password: string) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  return await bcryptjs.hash(password, rounds);
}

async function compare(provided: string, storedPassword: string) {
  return await bcryptjs.compare(provided, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
