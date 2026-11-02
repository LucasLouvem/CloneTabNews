import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

const url = "http:127.0.0.1:3000";
describe("GET /migrations", () => {
  describe("Anonymous user", () => {
    it("Recebe retorno da API de migrations", async () => {
      const response = await fetch(`${url}/api/v1/migrations`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toEqual(true);
    });
  });
});
