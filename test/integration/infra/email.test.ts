import email from "infra/email";
import orchestrator from "test/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("Envio de e-mail via SMTP", () => {
  it("preserva remetente, destinatário e corpo de texto no e-mail capturado", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "sender@example.com",
      to: "recipient@example.com",
      text: "Hello",
    });

    await email.send({
      from: "sender@example.com",
      to: "recipient@example.com",
      text: "Hello",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<sender@example.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@example.com>");
    expect(lastEmail.text).toBe("Hello\n");
  });
});
