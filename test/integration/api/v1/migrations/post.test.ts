import orchestrator from "test/orchestrator";

const baseUrl = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 201 ao executar as migrations pendentes", async () => {
      const response = await fetch(`${baseUrl}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toEqual(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });

    it("Retorna 200 quando não há migrations pendentes", async () => {
      const response = await fetch(`${baseUrl}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toEqual(true);
      expect(responseBody.length).toBe(0);
    });
  });
});
