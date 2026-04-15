import { customAlphabet } from "nanoid";
import { randomBytes } from "crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const nano24 = customAlphabet(alphabet, 24);

export function generateToken(): string {
  return nano24();
}

export function generateShortCode(): string {
  const bytes = randomBytes(4).toString("hex").toUpperCase();
  return `TKT-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}
