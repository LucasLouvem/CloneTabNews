import orchestrator from "test/orchestrator";

const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("DELETE /migrations", () => {
  describe("Anonymous user", () => {
    it("Retornar erro de metodo não permitido", async () => {
      const response = await fetch(`${url}/api/v1/migrations`, {
        method: "DELETE",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        error: "MethodNotAllowed",
      });
    });
  });
});
