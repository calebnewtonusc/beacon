# Beacon

On-chain reputation protocol on Solana. Soulbound attestations, ed25519-verified payloads, permissionless revocation, and a Helius-indexed reputation graph.

> Verifiable by anyone, owned by no one.

---

## What's in this repo

| Path               | Role                | Stack                                                 |
| ------------------ | ------------------- | ----------------------------------------------------- |
| `programs/beacon`  | Anchor program      | Rust, Anchor 0.30, Solana 1.18                        |
| `packages/sdk`     | TypeScript SDK      | `@solana/web3.js`, tweetnacl, strict TS               |
| `packages/indexer` | Event indexer + API | Fastify, node-postgres, Helius enhanced webhooks      |
| `apps/web`         | dApp and analytics  | Next.js 15 App Router, Tailwind, Framer Motion, Privy |

Four surfaces, one credential graph. Each is independently useful.

---

## Program design

Three account types, four instructions.

### Accounts

- **Schema** (`PDA[schema, authority, schema_id]`). Namespaces a credential type. Tracks issuance and revocation counts.
- **Attestation** (`PDA[attestation, schema, issuer, subject, payload_hash]`). The soulbound credential. Immutable except for `revoked_at`.
- **VerifierScore** (`PDA[verifier, issuer]`). Rolling reputation score for an issuer, expressed in basis points (0 to 10000).

### Instructions

- `register_schema(schema_id, name, uri, revocable)`
- `issue_attestation(subject, payload_hash, expires_at, payload)` — requires a preceding `Ed25519Program` instruction signed by the issuer over `payload_hash`.
- `revoke_attestation()` — only the original issuer, only if the schema is `revocable`.
- `touch_verifier()` — idempotent initializer for `VerifierScore`.

### Events

- `SchemaRegistered`
- `AttestationIssued`
- `AttestationRevoked`

All three are emitted via `#[event]` and decoded by the indexer out of the `Program data:` log line.

---

## Quick start

### 1. Build and deploy the program

```bash
# Requires the Solana + Anchor toolchain (avm, anchor 0.30.1)
anchor keys list        # replace the placeholder ID in lib.rs + Anchor.toml
anchor build
anchor deploy --provider.cluster devnet
anchor idl init --filepath target/idl/beacon.json $(solana address -k target/deploy/beacon-keypair.json) --provider.cluster devnet
```

### 2. Run the indexer

```bash
cd packages/indexer
cp .env.example .env
psql $DATABASE_URL -f migrations/001_init.sql
pnpm install
pnpm dev
# POST /webhook/helius, GET /stats, GET /healthz
```

Point a Helius enhanced webhook at `POST {INDEXER_URL}/webhook/helius` with the deployed program ID as the watched address.

### 3. Run the web app

```bash
cd apps/web
cp .env.example .env.local
pnpm install
pnpm dev
# open http://localhost:3000
```

### 4. Use the SDK

```ts
import {
  BeaconClient,
  deriveSchemaPda,
  schemaIdFromName,
} from "@beacon-protocol/sdk";
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection(process.env.SOLANA_RPC!);
const client = new BeaconClient(connection);

const issuer = Keypair.generate();
const subject = Keypair.generate().publicKey;
const schemaId = schemaIdFromName("usc.verified-student");
const [schema] = deriveSchemaPda(issuer.publicKey, schemaId);

const { tx } = client.buildIssueTransaction(issuer, {
  schema,
  subject,
  payload: new TextEncoder().encode(JSON.stringify({ verified: true })),
});
```

---

## Architecture

```
       ┌──────────────────────────────┐
       │        Anchor program        │  source of truth
       │  Rust · ed25519 · PDAs       │
       └──────────────┬───────────────┘
                      │ emit!() events
                      ▼
       ┌──────────────────────────────┐
       │  Helius enhanced webhooks    │
       └──────────────┬───────────────┘
                      ▼
       ┌──────────────────────────────┐
       │   Fastify indexer + pg       │  rebuilds reputation graph
       └──────────────┬───────────────┘
                      ▼
  ┌───────────────────┴────────────────────┐
  │      Next.js dApp + analytics          │  Privy wallet
  │  Issue · Verify · Reputation dashboard │
  └────────────────────────────────────────┘
```

---

## Security notes

- **Ed25519 verification is program-enforced.** The program loads the preceding instruction from the instructions sysvar, confirms it's an `Ed25519Program` instruction, and checks the signer + message match the issuer and the `payload_hash`. This means the issuer can't delegate signing to the program's fee payer.
- **Soulbound by construction.** There is no `transfer` instruction. An attestation PDA is tied to `(schema, issuer, subject, payload_hash)` and can only be revoked.
- **No custody.** The protocol never holds funds. Revocation only flips a timestamp; no one can forge or delete an attestation.

---

## Project notes

This repo is a full-stack protocol sample: Anchor program, typed SDK, indexer, and dApp. The public devnet deployment is part of the Beacon Protocol devnet; the program ID in `Anchor.toml` is the placeholder, replace after `anchor build` + `anchor keys list`.

All glory to God! ✝️❤️
