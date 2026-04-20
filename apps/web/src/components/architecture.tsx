"use client";

import { motion } from "framer-motion";
import { Code2, Database, Globe2, Webhook } from "lucide-react";

const layers = [
  {
    icon: Code2,
    title: "Anchor program",
    subtitle: "Rust / Solana runtime",
    body: "6 instruction handlers, 3 account types, ed25519 signature verification via the instructions sysvar, soulbound PDA attestations.",
    stack: ["anchor 0.30", "solana 1.18", "ed25519-program"],
    accent: "from-indigo-500/20 to-transparent",
  },
  {
    icon: Globe2,
    title: "TypeScript SDK",
    subtitle: "Client tx builder",
    body: "Typed PDA derivation, tx builders for every instruction, sha256 payload hashing, ed25519 signing, and Borsh-equivalent arg encoding.",
    stack: ["@solana/web3.js", "tweetnacl", "tsc strict"],
    accent: "from-violet-500/20 to-transparent",
  },
  {
    icon: Webhook,
    title: "Helius indexer",
    subtitle: "Fastify + pg",
    body: "Receives enhanced webhooks, decodes Program data log events, fans out to Postgres, and maintains verifier reputation via a SQL function.",
    stack: ["fastify", "pg", "helius webhooks"],
    accent: "from-fuchsia-500/20 to-transparent",
  },
  {
    icon: Database,
    title: "Analytics surface",
    subtitle: "Next.js + RSC",
    body: "React Server Components read aggregates from the indexer. Privy wallets sign issuance flows. No backend for auth — everything is the chain or the wallet.",
    stack: ["next 15", "privy", "framer-motion"],
    accent: "from-emerald-500/20 to-transparent",
  },
];

export function Architecture() {
  return (
    <section className="relative py-24 md:py-32 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-4">
            Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
            Four surfaces. One credential graph.
          </h2>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
            Each layer is independently useful. Fork the SDK without the web
            app. Run the indexer without a dashboard. The Anchor program is the
            source of truth.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          {layers.map((l, i) => (
            <motion.div
              key={l.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-zinc-700 transition-all"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${l.accent} blur-3xl`}
              />
              <div className="relative flex items-start gap-4">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-200 shrink-0">
                  <l.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    {l.subtitle}
                  </div>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    {l.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {l.body}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {l.stack.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
