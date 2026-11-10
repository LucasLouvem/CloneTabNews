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

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    it("Encontra usuário com maiúsculas e minúsculas iguais", async () => {
      const response = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "MesmoCaso",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(`${url}/api/v1/users/MesmoCaso`);

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCaso",
        email: "teste@teste.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    it("Encontra usuário com maiúsculas e minúsculas diferentes", async () => {
      const response = await fetch(`${url}/api/v1/users`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          username: "outrocaso",
          email: "teste@teste.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(`${url}/api/v1/users/OutroCaso`);

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "outrocaso",
        email: "teste@teste.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });

    it("Retorna 404 para usuário inexistente", async () => {
      const response = await fetch(`${url}/api/v1/users/naoexistente`);

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o nome de usuário e tente novamente.",
        status_code: 404,
      });
    });
  });
});
