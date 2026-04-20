create table if not exists schemas (
  pubkey text primary key,
  authority text not null,
  schema_id text not null,
  name text not null,
  uri text not null,
  revocable boolean not null default false,
  issued_count bigint not null default 0,
  revoked_count bigint not null default 0,
  created_at timestamptz not null,
  slot bigint not null,
  signature text not null
);

create index if not exists schemas_authority_idx on schemas (authority);
create index if not exists schemas_created_at_idx on schemas (created_at desc);

create table if not exists attestations (
  pubkey text primary key,
  schema text not null references schemas (pubkey),
  issuer text not null,
  subject text not null,
  payload_hash text not null,
  issued_at timestamptz not null,
  expires_at timestamptz,
  revoked_at timestamptz,
  slot bigint not null,
  signature text not null
);

create index if not exists attestations_issuer_idx on attestations (issuer);
create index if not exists attestations_subject_idx on attestations (subject);
create index if not exists attestations_schema_idx on attestations (schema);
create index if not exists attestations_issued_at_idx on attestations (issued_at desc);

create table if not exists verifier_scores (
  issuer text primary key,
  issued bigint not null default 0,
  revoked bigint not null default 0,
  reputation integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  kind text not null,
  payload jsonb not null,
  slot bigint not null,
  signature text not null,
  created_at timestamptz not null default now()
);

create index if not exists events_kind_created_idx on events (kind, created_at desc);
create index if not exists events_signature_idx on events (signature);
