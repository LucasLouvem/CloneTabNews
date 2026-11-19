import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";

const baseUrl = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 200 quando o nome de usuário corresponde exatamente", async () => {
      await orchestrator.createUser({
        username: "MesmoCaso",
      });

      const response = await fetch(`${baseUrl}/api/v1/users/MesmoCaso`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCaso",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    it("Retorna 200 ignorando diferenças entre maiúsculas e minúsculas", async () => {
      await orchestrator.createUser({
        username: "outrocaso",
        email: "teste@teste.com",
        password: "senha123",
      });

      const response = await fetch(`${baseUrl}/api/v1/users/OutroCaso`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "outrocaso",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    it("Retorna 404 para usuário inexistente", async () => {
      const response = await fetch(`${baseUrl}/api/v1/users/naoexistente`);

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
