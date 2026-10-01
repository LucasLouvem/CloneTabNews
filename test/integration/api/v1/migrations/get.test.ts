const url = "http:127.0.0.1:3000";

interface StatusResponse {
  updated_at: Date;
  db_version: string;
  usage_connections: number;
  max_connections: number;
}

it("Fetch para Status page deve retornar 200", async () => {
  const response = await fetch(`${url}/api/v1/migrations`);

  expect(response.status).toBe(200);

  const responseBody = (await response.json()) as StatusResponse;

  console.log(responseBody);

  expect(Array.isArray(responseBody)).toEqual(true);
});

export {};
