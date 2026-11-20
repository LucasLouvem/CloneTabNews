import session from "models/session";
import orchestrator from "test/orchestrator";
import { version as uuidVersion } from "uuid";
import { parse as parseSetCookie } from "set-cookie-parser";

const baseUrl = "http:127.0.0.1:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/user", () => {
  describe("Encerramento da sessão pelo cookie de autenticação", () => {
    it("Retorna 401 quando a sessão está expirada", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRES_IN_MILLISECONDS),
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const createdSession = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        action: "Faça login novamente para acessar este recurso.",
        status_code: 401,
      });
    });

    it("Retorna 401 quando o token não corresponde a uma sessão cadastrada", async () => {
      const unknownSessionToken =
        "2484b9771c4256331194a7fae396717b9f7bd017e60e03e47c92ca34ad2fea1d3ff34b274f1c1a83e4ceb0280fbb466b";

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${unknownSessionToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        action: "Faça login novamente para acessar este recurso.",
        status_code: 401,
      });
    });

    it("Retorna 200, expira a sessão e o cookie e rejeita o token em uma nova consulta", async () => {
      const createdUser = await orchestrator.createUser();

      const createdSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });

      expect(response.status).toBe(200);

      const expiredSessionResponseBody = await response.json();

      expect(expiredSessionResponseBody).toEqual({
        id: createdSession.id,
        token: createdSession.token,
        user_id: createdSession.user_id,
        expires_at: expiredSessionResponseBody.expires_at,
        created_at: expiredSessionResponseBody.created_at,
        updated_at: expiredSessionResponseBody.updated_at,
      });

      expect(uuidVersion(expiredSessionResponseBody.id)).toBe(4);
      expect(Date.parse(expiredSessionResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(expiredSessionResponseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(expiredSessionResponseBody.expires_at)).not.toBeNaN();

      expect(
        expiredSessionResponseBody.expires_at <
          createdSession.expires_at.toISOString(),
      ).toBe(true);
      expect(
        expiredSessionResponseBody.updated_at >
          createdSession.updated_at.toISOString(),
      ).toBe(true);
      // Verifica a expiração do cookie da sessão

      const cookiesByName = parseSetCookie(response.headers.getSetCookie(), {
        map: true,
      });

      expect(cookiesByName.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        maxAge: -1,
        path: "/",
        value: "invalid",
      });

      // Verifica que o token não permite consultar o usuário após o logout
      const responseAfterLogout = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });

      expect(responseAfterLogout.status).toBe(401);

      const responseAfterLogoutBody = await responseAfterLogout.json();

      expect(responseAfterLogoutBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão inválida ou expirada.",
        action: "Faça login novamente para acessar este recurso.",
        status_code: 401,
      });
    });
  });
});
