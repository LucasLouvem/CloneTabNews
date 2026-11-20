import session from "models/session";
import user from "models/user";
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

describe("GET /api/v1/user", () => {
  describe("Consulta do usuário pelo cookie de sessão", () => {
    it("Retorna 200, os dados do usuário e renova a sessão e o cookie quando a sessão é válida", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });
      const createdSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch(`${baseUrl}/api/v1/user`, {
        headers: {
          Cookie: `session_id=${createdSession.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe("no-stored,no-cache,max-age=0,must-revalidate");

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Renovando a sessão
      const renewedSession = await user.findOneValidByToken(
        createdSession.token,
      );

      expect(renewedSession.expires_at > createdSession.expires_at).toBe(true);
      expect(renewedSession.updated_at > createdSession.updated_at).toBe(true);
      // atualizando o cookie da sessão

      const cookiesByName = parseSetCookie(response.headers.getSetCookie(), {
        map: true,
      });

      expect(cookiesByName.session_id).toEqual({
        name: "session_id",
        httpOnly: true,
        maxAge: session.EXPIRES_IN_MILLISECONDS / 1000,
        path: "/",
        value: renewedSession.token,
      });
    });

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
  });
});
