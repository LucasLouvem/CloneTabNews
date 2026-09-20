const url = "http:127.0.0.1:3000";

interface StatusResponse {
  updated_at: Date;
  db_version: string;
  usage_connections: number;
  max_connections: number;
}

it("Fetch para Status page deve retornar 200", async () => {
  const response = await fetch(`${url}/api/v1/status`);

  expect(response.status).toBe(200);

  const responseBody = (await response.json()) as StatusResponse;

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

  expect(responseBody).toEqual({
    updated_at: parsedUpdatedAt,
    db_version: "16.15",
    usage_connections: 1,
    max_connections: 100,
  });
});

export {};
