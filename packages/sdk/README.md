# @beacon-protocol/sdk

TypeScript SDK for the Beacon on-chain reputation protocol on Solana.

## Install

```bash
bun add @beacon-protocol/sdk @solana/web3.js
```

## Usage

```ts
import {
  BeaconClient,
  deriveSchemaPda,
  schemaIdFromName,
} from "@beacon-protocol/sdk";
import { Connection, Keypair } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const client = new BeaconClient(connection);

const issuer = Keypair.generate();
const subject = Keypair.generate().publicKey;
const schemaId = schemaIdFromName("beacon.usc.verified-student");
const [schema] = deriveSchemaPda(issuer.publicKey, schemaId);

const { tx, attestation, payloadHash } = client.buildIssueTransaction(issuer, {
  schema,
  subject,
  payload: new TextEncoder().encode(JSON.stringify({ verified: true })),
});
```

All glory to God! ✝️❤️
