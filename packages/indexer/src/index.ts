import Fastify from "fastify";
import {
  createDb,
  ensureReputationFunction,
  insertAttestation,
  markRevoked,
  recordEvent,
  upsertSchema,
} from "./db";
import { decodeEventLog } from "./decoder";

type HeliusWebhookTx = {
  slot: number;
  signature: string;
  meta?: { logMessages?: string[] };
  blockTime?: number;
};

const PORT = Number(process.env.PORT ?? 8787);
const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://localhost/beacon";
const WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET ?? "";

async function main() {
  const db = createDb(DATABASE_URL);
  await ensureReputationFunction(db);

  const app = Fastify({ logger: { level: "info" } });

  app.get("/healthz", async () => ({ ok: true }));

  app.post("/webhook/helius", async (req, reply) => {
    if (WEBHOOK_SECRET) {
      const auth = req.headers.authorization ?? "";
      if (auth !== `Bearer ${WEBHOOK_SECRET}`) {
        return reply.code(401).send({ error: "unauthorized" });
      }
    }
    const batch = req.body as HeliusWebhookTx[];
    if (!Array.isArray(batch))
      return reply.code(400).send({ error: "bad payload" });

    let processed = 0;
    for (const tx of batch) {
      const logs = tx.meta?.logMessages ?? [];
      const events = decodeEventLog(logs);
      const eventTime = new Date((tx.blockTime ?? Date.now() / 1000) * 1000);

      for (const ev of events) {
        processed += 1;
        await recordEvent(db, ev.kind, ev, tx.slot, tx.signature);
        if (ev.kind === "schema_registered") {
          await upsertSchema(db, {
            pubkey: ev.schema,
            authority: ev.authority,
            schemaId: ev.schemaId,
            name: "",
            uri: "",
            revocable: ev.revocable,
            createdAt: eventTime,
            slot: tx.slot,
            signature: tx.signature,
          });
        } else if (ev.kind === "attestation_issued") {
          await insertAttestation(db, {
            pubkey: ev.attestation,
            schema: ev.schema,
            issuer: ev.issuer,
            subject: ev.subject,
            payloadHash: ev.payloadHash,
            issuedAt: eventTime,
            expiresAt:
              ev.expiresAt > 0n ? new Date(Number(ev.expiresAt) * 1000) : null,
            slot: tx.slot,
            signature: tx.signature,
          });
        } else if (ev.kind === "attestation_revoked") {
          await markRevoked(db, {
            pubkey: ev.attestation,
            schema: ev.schema,
            issuer: ev.issuer,
            revokedAt: new Date(Number(ev.revokedAt) * 1000),
          });
        }
      }
    }

    return reply.send({ processed, txs: batch.length });
  });

  app.get("/stats", async () => {
    const { rows: schemas } = await db.query<{ c: string }>(
      "select count(*)::text as c from schemas",
    );
    const { rows: atts } = await db.query<{ c: string }>(
      "select count(*)::text as c from attestations",
    );
    const { rows: verifiers } = await db.query<{ c: string }>(
      "select count(*)::text as c from verifier_scores",
    );
    return {
      schemas: Number(schemas[0]?.c ?? 0),
      attestations: Number(atts[0]?.c ?? 0),
      verifiers: Number(verifiers[0]?.c ?? 0),
    };
  });

  await app.listen({ host: "0.0.0.0", port: PORT });
  app.log.info(`Beacon indexer listening on :${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
