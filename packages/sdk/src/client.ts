import {
  Connection,
  Ed25519Program,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
  type Signer,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { hashPayload } from "./hash";
import {
  BEACON_PROGRAM_ID,
  deriveAttestationPda,
  deriveSchemaPda,
  deriveVerifierPda,
} from "./pda";
import type { IssueArgs, RegisterSchemaArgs } from "./types";

const DISCRIMINATORS = {
  registerSchema: Buffer.from([173, 34, 15, 148, 11, 91, 35, 236]),
  issueAttestation: Buffer.from([233, 56, 41, 191, 82, 6, 24, 13]),
  revokeAttestation: Buffer.from([108, 11, 164, 174, 96, 129, 104, 179]),
  touchVerifier: Buffer.from([223, 66, 18, 39, 112, 61, 48, 203]),
};

function encodeString(s: string): Buffer {
  const bytes = Buffer.from(s, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, bytes]);
}

function encodeBytes(bytes: Uint8Array): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32LE(bytes.length, 0);
  return Buffer.concat([len, Buffer.from(bytes)]);
}

function encodeI64(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(value, 0);
  return buf;
}

function encodeBool(value: boolean): Buffer {
  return Buffer.from([value ? 1 : 0]);
}

export class BeaconClient {
  constructor(
    public readonly connection: Connection,
    public readonly programId: PublicKey = BEACON_PROGRAM_ID,
  ) {}

  registerSchemaIx(
    authority: PublicKey,
    args: RegisterSchemaArgs,
  ): { ix: TransactionInstruction; schema: PublicKey } {
    const [schema] = deriveSchemaPda(authority, args.schemaId, this.programId);
    const data = Buffer.concat([
      DISCRIMINATORS.registerSchema,
      Buffer.from(args.schemaId),
      encodeString(args.name),
      encodeString(args.uri),
      encodeBool(args.revocable),
    ]);
    const ix = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: schema, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
    return { ix, schema };
  }

  buildIssueTransaction(
    issuerKeypair: Signer,
    args: IssueArgs,
  ): { tx: Transaction; attestation: PublicKey; payloadHash: Uint8Array } {
    const payloadHash = hashPayload(args.payload);
    const [attestation] = deriveAttestationPda(
      args.schema,
      issuerKeypair.publicKey,
      args.subject,
      payloadHash,
      this.programId,
    );
    const [verifierScore] = deriveVerifierPda(
      issuerKeypair.publicKey,
      this.programId,
    );

    const signature = nacl.sign.detached(payloadHash, issuerKeypair.secretKey);
    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: issuerKeypair.publicKey.toBytes(),
      message: payloadHash,
      signature,
    });

    const ixData = Buffer.concat([
      DISCRIMINATORS.issueAttestation,
      args.subject.toBuffer(),
      Buffer.from(payloadHash),
      encodeI64(args.expiresAt ?? 0n),
      encodeBytes(args.payload),
    ]);

    const issueIx = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: args.schema, isSigner: false, isWritable: true },
        { pubkey: attestation, isSigner: false, isWritable: true },
        { pubkey: verifierScore, isSigner: false, isWritable: true },
        { pubkey: issuerKeypair.publicKey, isSigner: true, isWritable: true },
        {
          pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: ixData,
    });

    const tx = new Transaction().add(ed25519Ix).add(issueIx);
    return { tx, attestation, payloadHash };
  }

  revokeAttestationIx(
    issuer: PublicKey,
    schema: PublicKey,
    attestation: PublicKey,
  ): TransactionInstruction {
    const [verifierScore] = deriveVerifierPda(issuer, this.programId);
    return new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: schema, isSigner: false, isWritable: true },
        { pubkey: attestation, isSigner: false, isWritable: true },
        { pubkey: verifierScore, isSigner: false, isWritable: true },
        { pubkey: issuer, isSigner: true, isWritable: true },
      ],
      data: DISCRIMINATORS.revokeAttestation,
    });
  }

  touchVerifierIx(issuer: PublicKey): TransactionInstruction {
    const [verifierScore] = deriveVerifierPda(issuer, this.programId);
    return new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: verifierScore, isSigner: false, isWritable: true },
        { pubkey: issuer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: DISCRIMINATORS.touchVerifier,
    });
  }
}
