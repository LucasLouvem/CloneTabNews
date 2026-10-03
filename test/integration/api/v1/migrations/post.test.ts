const url = "http:127.0.0.1:3000";

it("POST para /migrations deve retornar 200", async () => {
  const response = await fetch(`${url}/api/v1/migrations`, {
    method: "POST",
  });

  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toEqual(true);
});

export {};
