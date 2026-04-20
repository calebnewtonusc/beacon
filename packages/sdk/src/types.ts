import type { PublicKey } from "@solana/web3.js";

export const BEACON_PROGRAM_ID_STR =
  "Bcn11111111111111111111111111111111111111";

export const SCHEMA_SEED = Buffer.from("schema");
export const ATTESTATION_SEED = Buffer.from("attestation");
export const VERIFIER_SEED = Buffer.from("verifier");

export type SchemaAccount = {
  authority: PublicKey;
  schemaId: Uint8Array;
  name: string;
  uri: string;
  revocable: boolean;
  issuedCount: bigint;
  revokedCount: bigint;
  createdAt: bigint;
  bump: number;
};

export type AttestationAccount = {
  schema: PublicKey;
  issuer: PublicKey;
  subject: PublicKey;
  payloadHash: Uint8Array;
  payload: Uint8Array;
  issuedAt: bigint;
  expiresAt: bigint;
  revokedAt: bigint;
  bump: number;
};

export type VerifierScoreAccount = {
  issuer: PublicKey;
  issued: bigint;
  revoked: bigint;
  reputation: number;
  lastTouched: bigint;
  bump: number;
};

export type IssueArgs = {
  schema: PublicKey;
  subject: PublicKey;
  payload: Uint8Array;
  expiresAt?: bigint;
};

export type RegisterSchemaArgs = {
  schemaId: Uint8Array;
  name: string;
  uri: string;
  revocable: boolean;
};
