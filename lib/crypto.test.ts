import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto";

process.env.EMAIL_SECRETS_KEY = "zFq8pXJ4W5YxQ2cJ8rW6wH9tK1NmB3vR7xL2aE0uP5c=";

describe("crypto", () => {
  it("roundtrips a string", () => {
    const plain = "re_abc123_verySecretApiKey";
    const cipher = encrypt(plain);
    expect(cipher).not.toBe(plain);
    expect(cipher).toMatch(/^v1:/);
    expect(decrypt(cipher)).toBe(plain);
  });

  it("produces different ciphertext for same input (random IV)", () => {
    expect(encrypt("hello")).not.toBe(encrypt("hello"));
  });

  it("throws on tampered ciphertext", () => {
    const c = encrypt("hello");
    const tampered = c.slice(0, -2) + "xx";
    expect(() => decrypt(tampered)).toThrow();
  });
});
