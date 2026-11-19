import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

const baseUrl = "http:127.0.0.1:3000";
describe("GET /api/v1/migrations", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 200 e lista as migrations pendentes", async () => {
      const response = await fetch(`${baseUrl}/api/v1/migrations`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toEqual(true);
    });
  });
});
