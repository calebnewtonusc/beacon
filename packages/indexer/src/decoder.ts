import bs58 from "bs58";

const SCHEMA_REGISTERED_DISCRIMINATOR = "34,88,150,135,182,251,226,105";
const ATTESTATION_ISSUED_DISCRIMINATOR = "199,230,40,198,165,226,78,184";
const ATTESTATION_REVOKED_DISCRIMINATOR = "88,176,77,153,114,218,172,207";

export type DecodedEvent =
  | {
      kind: "schema_registered";
      schema: string;
      authority: string;
      schemaId: string;
      revocable: boolean;
    }
  | {
      kind: "attestation_issued";
      attestation: string;
      schema: string;
      issuer: string;
      subject: string;
      payloadHash: string;
      expiresAt: bigint;
    }
  | {
      kind: "attestation_revoked";
      attestation: string;
      schema: string;
      issuer: string;
      revokedAt: bigint;
    };

export function decodeEventLog(logs: string[]): DecodedEvent[] {
  const events: DecodedEvent[] = [];
  for (const log of logs) {
    const match = log.match(/^Program data: (.+)$/);
    if (!match) continue;
    try {
      const bytes = Buffer.from(match[1], "base64");
      if (bytes.length < 8) continue;
      const disc = Array.from(bytes.subarray(0, 8)).join(",");
      if (disc === SCHEMA_REGISTERED_DISCRIMINATOR) {
        events.push({
          kind: "schema_registered",
          schema: bs58.encode(bytes.subarray(8, 40)),
          authority: bs58.encode(bytes.subarray(40, 72)),
          schemaId: Buffer.from(bytes.subarray(72, 104)).toString("hex"),
          revocable: bytes[104] === 1,
        });
      } else if (disc === ATTESTATION_ISSUED_DISCRIMINATOR) {
        events.push({
          kind: "attestation_issued",
          attestation: bs58.encode(bytes.subarray(8, 40)),
          schema: bs58.encode(bytes.subarray(40, 72)),
          issuer: bs58.encode(bytes.subarray(72, 104)),
          subject: bs58.encode(bytes.subarray(104, 136)),
          payloadHash: Buffer.from(bytes.subarray(136, 168)).toString("hex"),
          expiresAt: bytes.readBigInt64LE(168),
        });
      } else if (disc === ATTESTATION_REVOKED_DISCRIMINATOR) {
        events.push({
          kind: "attestation_revoked",
          attestation: bs58.encode(bytes.subarray(8, 40)),
          schema: bs58.encode(bytes.subarray(40, 72)),
          issuer: bs58.encode(bytes.subarray(72, 104)),
          revokedAt: bytes.readBigInt64LE(104),
        });
      }
    } catch {
      continue;
    }
  }
  return events;
}
