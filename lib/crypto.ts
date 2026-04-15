import "server-only";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

function getKey(): Buffer {
  const key = Buffer.from(process.env.EMAIL_SECRETS_KEY || "", "base64");
  if (key.length !== 32) {
    throw new Error("EMAIL_SECRETS_KEY must be 32 bytes base64");
  }
  return key;
}

export function encrypt(plain: string): string {
  const KEY = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const KEY = getKey();
  const parts = payload.split(":");
  if (parts[0] !== "v1" || parts.length !== 4) throw new Error("invalid ciphertext");
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const enc = Buffer.from(parts[3], "base64");
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
