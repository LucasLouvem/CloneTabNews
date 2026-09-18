const url = "http:127.0.0.1:3000";

interface StatusResponse {
  name: string;

  como_resolver: string;
  status_code: number;
}

it("Fetch para Status page deve retornar 200", async () => {
  const response = await fetch(`${url}/api/v1/status`);

  expect(response.status).toBe(200);

  const responseBody = (await response.json()) as StatusResponse;
});

export {};
