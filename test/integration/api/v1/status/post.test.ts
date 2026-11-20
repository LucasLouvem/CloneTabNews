import orchestrator from "test/orchestrator";

const baseUrl = "http:127.0.0.1:3000";
interface StatusResponse {
  name: string;
  message: string;
  action: string;
  status_code: number;
}

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/status", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 405 para um método não permitido", async () => {
      const response = await fetch(`${baseUrl}/api/v1/status`, {
        method: "POST",
      });

      expect(response.status).toBe(405);

      const responseBody = (await response.json()) as StatusResponse;

      expect(responseBody).toEqual({
        name: "MethodNotAllowed",
        message: "Método não permitido para este endpoint",
        action: "Utilize o método correto",
        status_code: 405,
      });
    });
  });
});
