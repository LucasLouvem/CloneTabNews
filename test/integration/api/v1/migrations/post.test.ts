import orchestrator from "test/orchestrator";

const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET /migrations", () => {
  describe("Anonymous user", () => {
    it("1° requisição roda as migrations do sistema", async () => {
      const response = await fetch(`${url}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toEqual(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });

    it("2° requisição confirmando a execução", async () => {
      const response2 = await fetch(`${url}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(Array.isArray(response2Body)).toEqual(true);
      expect(response2Body.length).toBe(0);
    });
  });
});
