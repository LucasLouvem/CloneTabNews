import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";
import { EXPIRES_IN_MILLISECONDS } from "models/session";

const url = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    it("Retorna 401 para email não cadastrado", async () => {
      const response = await fetch(`${url}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          email: "incorrect-email",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Acesso não autorizado.",
        action: "Verifique os dados enviados novamente.",
        status_code: 401,
      });
    });

    it("Retorna 401 para senha incorreta", async () => {
      await orchestrator.createUser({
        email: "emailcorreto@teste.com",
      });
      const response = await fetch(`${url}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          email: "emailcorreto@teste.com",
          password: "senha-incorreta",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Acesso não autorizado.",
        action: "Verifique os dados enviados novamente.",
        status_code: 401,
      });
    });

    it("Cria sessão com email e senha corretos", async () => {
      const createdUser = await orchestrator.createUser({
        email: "emailcorreto@teste.com",
        password: "senhacorreta",
      });

      const response = await fetch(`${url}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "content-type": "application/JSON",
        },
        body: JSON.stringify({
          email: "emailcorreto@teste.com",
          password: "senhacorreta",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
        expires_at: responseBody.expires_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

      const createdAt = new Date(responseBody.created_at).setMilliseconds(0);
      const expiresAt = new Date(responseBody.expires_at).setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(EXPIRES_IN_MILLISECONDS);
    });
  });
});
