import { describe, it, expect, vi } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ data: { id: "msg_123" }, error: null });

vi.mock("resend", () => {
  class MockResend {
    emails = { send: mockSend };
  }
  return { Resend: MockResend };
});

import { makeResendTransport } from "./resend";

describe("resend transport", () => {
  it("send returns an id", async () => {
    const t = makeResendTransport({ apiKey: "k", fromEmail: "a@b.c" });
    const r = await t.send({ to: "x@y.z", from: "a@b.c", subject: "S", html: "<p>h</p>" });
    expect(r.id).toBe("msg_123");
  });

  it("test returns ok true", async () => {
    const t = makeResendTransport({ apiKey: "k", fromEmail: "a@b.c" });
    const r = await t.test("x@y.z");
    expect(r.ok).toBe(true);
  });
});
