import { describe, it, expect } from "vitest";
import { generateToken, generateShortCode } from "./ticket-codes";

describe("ticket-codes", () => {
  it("generateToken returns a URL-safe 24-char string", () => {
    const t = generateToken();
    expect(t).toHaveLength(24);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generateToken is unique across 1000 iterations", () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateToken()));
    expect(set.size).toBe(1000);
  });

  it("generateShortCode matches TKT-XXXX-XXXX", () => {
    const c = generateShortCode();
    expect(c).toMatch(/^TKT-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });
});
