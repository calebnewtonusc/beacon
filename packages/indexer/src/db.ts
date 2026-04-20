import pg from "pg";

const { Pool } = pg;

export type Db = pg.Pool;

export function createDb(url: string): Db {
  return new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

export async function upsertSchema(
  db: Db,
  row: {
    pubkey: string;
    authority: string;
    schemaId: string;
    name: string;
    uri: string;
    revocable: boolean;
    createdAt: Date;
    slot: number;
    signature: string;
  },
) {
  await db.query(
    `insert into schemas (pubkey, authority, schema_id, name, uri, revocable, created_at, slot, signature)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (pubkey) do nothing`,
    [
      row.pubkey,
      row.authority,
      row.schemaId,
      row.name,
      row.uri,
      row.revocable,
      row.createdAt,
      row.slot,
      row.signature,
    ],
  );
}

export async function insertAttestation(
  db: Db,
  row: {
    pubkey: string;
    schema: string;
    issuer: string;
    subject: string;
    payloadHash: string;
    issuedAt: Date;
    expiresAt: Date | null;
    slot: number;
    signature: string;
  },
) {
  await db.query(
    `insert into attestations (pubkey, schema, issuer, subject, payload_hash, issued_at, expires_at, slot, signature)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (pubkey) do nothing`,
    [
      row.pubkey,
      row.schema,
      row.issuer,
      row.subject,
      row.payloadHash,
      row.issuedAt,
      row.expiresAt,
      row.slot,
      row.signature,
    ],
  );
  await db.query(
    `update schemas set issued_count = issued_count + 1 where pubkey = $1`,
    [row.schema],
  );
  await bumpVerifierIssued(db, row.issuer);
}

export async function markRevoked(
  db: Db,
  args: { pubkey: string; schema: string; issuer: string; revokedAt: Date },
) {
  await db.query(
    `update attestations set revoked_at = $2 where pubkey = $1 and revoked_at is null`,
    [args.pubkey, args.revokedAt],
  );
  await db.query(
    `update schemas set revoked_count = revoked_count + 1 where pubkey = $1`,
    [args.schema],
  );
  await bumpVerifierRevoked(db, args.issuer);
}

export async function bumpVerifierIssued(db: Db, issuer: string) {
  await db.query(
    `insert into verifier_scores (issuer, issued, updated_at)
     values ($1, 1, now())
     on conflict (issuer) do update
       set issued = verifier_scores.issued + 1,
           reputation = compute_reputation(verifier_scores.issued + 1, verifier_scores.revoked),
           updated_at = now()`,
    [issuer],
  );
}

export async function bumpVerifierRevoked(db: Db, issuer: string) {
  await db.query(
    `insert into verifier_scores (issuer, revoked, updated_at)
     values ($1, 1, now())
     on conflict (issuer) do update
       set revoked = verifier_scores.revoked + 1,
           reputation = compute_reputation(verifier_scores.issued, verifier_scores.revoked + 1),
           updated_at = now()`,
    [issuer],
  );
}

export async function recordEvent(
  db: Db,
  kind: string,
  payload: unknown,
  slot: number,
  signature: string,
) {
  await db.query(
    `insert into events (kind, payload, slot, signature) values ($1,$2::jsonb,$3,$4)`,
    [kind, JSON.stringify(payload), slot, signature],
  );
}

export async function ensureReputationFunction(db: Db) {
  await db.query(`
    create or replace function compute_reputation(issued bigint, revoked bigint)
    returns integer as $$
    begin
      if issued = 0 then return 0; end if;
      return least(10000, greatest(0, ((issued - revoked)::numeric / issued::numeric * 10000)::integer));
    end;
    $$ language plpgsql immutable;
  `);
}
