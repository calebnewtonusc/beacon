"use client";

import { motion } from "framer-motion";
import { FileCheck2, KeySquare, Network, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: FileCheck2,
    title: "Register a schema",
    body: "An authority registers a schema PDA. Schemas carry a 32-byte ID, a human name, an off-chain URI, and a revocable flag. Schema accounts tally issuance and revocation counts.",
    code: `beacon register-schema \\
  --name "usc.verified-student" \\
  --uri "ipfs://bafy.../schema.json" \\
  --revocable`,
  },
  {
    icon: KeySquare,
    title: "Sign a payload",
    body: "The issuer signs a sha256 hash of the credential payload using ed25519. The program verifies the signature by loading the preceding Ed25519Program instruction from the instructions sysvar.",
    code: `const hash = sha256(payload);
const sig = nacl.sign.detached(hash, issuer.secretKey);
tx.add(Ed25519Program.createInstruction({ ... }));`,
  },
  {
    icon: ShieldCheck,
    title: "Issue an attestation",
    body: "issue_attestation creates a PDA keyed by schema + issuer + subject + payload_hash. The subject gets a soulbound credential. The verifier's reputation score updates in-place.",
    code: `pub fn issue_attestation(ctx, subject, payload_hash, expires_at, payload) -> Result<()> {
    verify_ed25519_signed(&ix_sysvar, &issuer, &payload_hash)?;
    // ...
}`,
  },
  {
    icon: Network,
    title: "Stream + index",
    body: "Helius webhooks stream emitted events (SchemaRegistered, AttestationIssued, AttestationRevoked) into Postgres. The analytics dashboard reads typed aggregates from the indexer.",
    code: `POST /webhook/helius
→ decode Program data logs
→ upsert schemas / attestations
→ recompute verifier reputation`,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-4">
            Protocol mechanics
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
            From signed payload to on-chain reputation in four steps.
          </h2>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
            Beacon is small on purpose. Four instructions, three account types,
            one event stream. Every piece is independently verifiable.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
              <pre className="mt-5 text-[12px] leading-relaxed bg-black/50 border border-zinc-800 rounded-xl p-4 overflow-x-auto text-zinc-300">
                <code>{s.code}</code>
              </pre>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
