import orchestrator from "test/orchestrator";

const url = "http:127.0.0.1:3000";

beforeAll(orchestrator.clearDatabase);

it("POST para /migrations deve retornar 201 na primeira execução e 200 na segunda", async () => {
  const response = await fetch(`${url}/api/v1/migrations`, {
    method: "POST",
  });

  expect(response.status).toBe(201);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toEqual(true);
  expect(responseBody.length).toBeGreaterThan(0);

  // Depois de rodar as migrations

  const response2 = await fetch(`${url}/api/v1/migrations`, {
    method: "POST",
  });

  expect(response2.status).toBe(200);

  const response2Body = await response2.json();

  expect(Array.isArray(response2Body)).toEqual(true);
  expect(response2Body.length).toBe(0);
});

export {};
