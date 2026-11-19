import orchestrator from "test/orchestrator";

const baseUrl = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("DELETE /api/v1/migrations", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 405 para um método não permitido", async () => {
      const response = await fetch(`${baseUrl}/api/v1/migrations`, {
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
