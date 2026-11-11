import password from "models/password";
import user from "models/user";
import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";
const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    it("Retorna 404 para usuário inexistente", async () => {
      const response = await fetch(`${url}/api/v1/users/naoexistente`, {
        method: "PATCH",
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o nome de usuário e tente novamente.",
        status_code: 404,
      });
    });

    it("Retorna 400 para username já cadastrado", async () => {
      await orchestrator.createUser({
        username: "teste",
        email: "teste@teste.com",
      });

      await orchestrator.createUser({
        username: "teste2",
        email: "teste2@teste.com",
        password: "senha123",
      });

      const response = await fetch(`${url}/api/v1/users/teste2`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "teste",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Não foi possível realizar esta operação.",
        action: "Revise os dados e tente novamente.",
        status_code: 400,
      });
    });

    it("Retorna 400 para email já cadastrado", async () => {
      await orchestrator.createUser({
        username: "teste",
        email: "teste@teste.com",
      });

      await orchestrator.createUser({
        username: "teste2",
        email: "teste2@teste.com",
      });

      const response = await fetch(`${url}/api/v1/users/teste`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "teste2@teste.com",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Não foi possível realizar esta operação.",
        action: "Revise os dados e tente novamente.",
        status_code: 400,
      });
    });

    it("Atualiza o username quando ele está disponível", async () => {
      await orchestrator.createUser({
        username: "teste",
      });

      const response = await fetch(`${url}/api/v1/users/teste`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: "teste2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "teste2",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    it("Atualiza o email quando ele está disponível", async () => {
      await orchestrator.createUser({
        username: "teste",
        email: "teste@teste.com",
      });

      const response = await fetch(`${url}/api/v1/users/teste`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "teste2@teste.com",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "teste",
        email: "teste2@teste.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    it("Retorna 200 ao atualizar a senha", async () => {
      await orchestrator.createUser({
        username: "teste",
        password: "senha123",
      });

      const response = await fetch(`${url}/api/v1/users/teste`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          password: "novaSenha",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "teste",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("teste");

      const correctPasswordMatch = await password.compare(
        "novaSenha",
        userInDatabase.password,
      );

      const inCorrectPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(inCorrectPasswordMatch).toBe(false);
    });
  });
});
