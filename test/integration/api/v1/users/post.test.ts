import orchestrator from "test/orchestrator";
import user from "models/user";
import { version as uuidVersion } from "uuid";
import password from "models/password";

const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    it("Cria usuário com dados válidos", async () => {
      const response = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "teste",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "teste",
        email: "teste@teste.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("teste");

      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "senhaErrada",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    it("Retorna 400 para email já cadastrado", async () => {
      const response = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "teste",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "teste2",
          email: "Teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Não foi possível realizar esta operação.",
        action: "Revise os dados e tente novamente.",
        status_code: 400,
      });
    });

    it("Retorna 400 para username já cadastrado", async () => {
      const response = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "teste",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "Teste",
          email: "teste2@teste.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Não foi possível realizar esta operação.",
        action: "Revise os dados e tente novamente.",
        status_code: 400,
      });
    });
  });
});
