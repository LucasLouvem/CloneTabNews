import orchestrator from "test/orchestrator";

const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("DELETE /migrations", () => {
  describe("Anonymous user", () => {
    it("Retornar erro de método não permitido", async () => {
      const response = await fetch(`${url}/api/v1/migrations`, {
        method: "DELETE",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowed",
        message: "Método não permitido para este endpoint",
        action: "Utilize o método correto",
        status_code: 405,
      });
    });
  });
});
