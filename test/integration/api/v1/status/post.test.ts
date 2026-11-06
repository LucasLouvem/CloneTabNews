import orchestrator from "test/orchestrator";

const url = "http:127.0.0.1:3000";
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

describe("POST /status", () => {
  describe("Anonymous user", () => {
    it("Recebe os dados da API de status", async () => {
      const response = await fetch(`${url}/api/v1/status`, {
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
