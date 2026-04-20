import { createHash } from "crypto";

export function sha256(data: Uint8Array): Uint8Array {
  return new Uint8Array(
    createHash("sha256").update(Buffer.from(data)).digest(),
  );
}

export function schemaIdFromName(name: string): Uint8Array {
  return sha256(new TextEncoder().encode(name));
}

export function hashPayload(payload: Uint8Array): Uint8Array {
  return sha256(payload);
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("odd hex string");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
