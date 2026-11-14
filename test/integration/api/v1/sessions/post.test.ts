import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import { parse as parseSetCookie } from "set-cookie-parser";

const baseUrl = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Usuário não autenticado", () => {
    it("Retorna 401 quando o email não está cadastrado", async () => {
      const response = await fetch(`${baseUrl}/api/v1/sessions`, {
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

    it("Retorna 401 quando a senha está incorreta", async () => {
      await orchestrator.createUser({
        email: "emailcorreto@teste.com",
      });
      const response = await fetch(`${baseUrl}/api/v1/sessions`, {
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

    it("Retorna 201 e define o cookie da sessão quando as credenciais são válidas", async () => {
      const createdUser = await orchestrator.createUser({
        email: "emailcorreto@teste.com",
        password: "senhacorreta",
      });

      const response = await fetch(`${baseUrl}/api/v1/sessions`, {
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

      const sessionResponseBody = await response.json();

      expect(sessionResponseBody).toEqual({
        id: sessionResponseBody.id,
        token: sessionResponseBody.token,
        user_id: createdUser.id,
        created_at: sessionResponseBody.created_at,
        updated_at: sessionResponseBody.updated_at,
        expires_at: sessionResponseBody.expires_at,
      });

      expect(uuidVersion(sessionResponseBody.id)).toBe(4);
      expect(Date.parse(sessionResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(sessionResponseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(sessionResponseBody.expires_at)).not.toBeNaN();

      const createdAtInMilliseconds = new Date(
        sessionResponseBody.created_at,
      ).setMilliseconds(0);
      const expiresAtInMilliseconds = new Date(
        sessionResponseBody.expires_at,
      ).setMilliseconds(0);

      expect(expiresAtInMilliseconds - createdAtInMilliseconds).toBe(
        session.EXPIRES_IN_MILLISECONDS,
      );

      const cookiesByName = parseSetCookie(response.headers.getSetCookie(), {
        map: true,
      });

      expect(cookiesByName.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        maxAge: session.EXPIRES_IN_MILLISECONDS / 1000,
        path: "/",
        value: sessionResponseBody.token,
      });
    });
  });
});
