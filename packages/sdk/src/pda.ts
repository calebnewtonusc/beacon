import { PublicKey } from "@solana/web3.js";
import {
  ATTESTATION_SEED,
  BEACON_PROGRAM_ID_STR,
  SCHEMA_SEED,
  VERIFIER_SEED,
} from "./types";

export const BEACON_PROGRAM_ID = new PublicKey(BEACON_PROGRAM_ID_STR);

export function deriveSchemaPda(
  authority: PublicKey,
  schemaId: Uint8Array,
  programId: PublicKey = BEACON_PROGRAM_ID,
): [PublicKey, number] {
  if (schemaId.length !== 32) {
    throw new Error("schemaId must be 32 bytes");
  }
  return PublicKey.findProgramAddressSync(
    [SCHEMA_SEED, authority.toBuffer(), Buffer.from(schemaId)],
    programId,
  );
}

export function deriveAttestationPda(
  schema: PublicKey,
  issuer: PublicKey,
  subject: PublicKey,
  payloadHash: Uint8Array,
  programId: PublicKey = BEACON_PROGRAM_ID,
): [PublicKey, number] {
  if (payloadHash.length !== 32) {
    throw new Error("payloadHash must be 32 bytes");
  }
  return PublicKey.findProgramAddressSync(
    [
      ATTESTATION_SEED,
      schema.toBuffer(),
      issuer.toBuffer(),
      subject.toBuffer(),
      Buffer.from(payloadHash),
    ],
    programId,
  );
}

export function deriveVerifierPda(
  issuer: PublicKey,
  programId: PublicKey = BEACON_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VERIFIER_SEED, issuer.toBuffer()],
    programId,
  );
}
