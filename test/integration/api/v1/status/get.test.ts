import orchestrator from "test/orchestrator";

const baseUrl = "http:127.0.0.1:3000";
interface StatusResponse {
  updated_at: Date;
  db_version: string;
  usage_connections: number;
  max_connections: number;
}

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET /api/v1/status", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 200 e os dados de conexão do PostgreSQL", async () => {
      const response = await fetch(`${baseUrl}/api/v1/status`);

      expect(response.status).toBe(200);

      const responseBody = (await response.json()) as StatusResponse;

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody).toEqual({
        updated_at: parsedUpdatedAt,
        dependencies: {
          version: "16.15",
          max_connections: 100,
          opened_connections: 1,
        },
      });
    });
  });
});
