"use client";

import { motion } from "framer-motion";
import {
  Award,
  GraduationCap,
  HeartPulse,
  Hexagon,
  Layers,
  Users,
} from "lucide-react";
import { shortAddress } from "@/lib/utils";

const schemas = [
  {
    icon: GraduationCap,
    name: "usc.verified-student",
    authority: "BcnAuth1K9v8yZxX7qL4pN2kT3M1vW0zF6sD5cB3a7eH9",
    issued: 412,
    revoked: 3,
    reputation: 9927,
    tone: "from-indigo-500 to-violet-600",
  },
  {
    icon: Award,
    name: "trojan-tech.officer",
    authority: "BcnTTS2h7L8pQ1nK6mD4wZ3vR9tS5yN0xC2bJ8eA4fM1",
    issued: 12,
    revoked: 0,
    reputation: 10000,
    tone: "from-emerald-500 to-teal-600",
  },
  {
    icon: HeartPulse,
    name: "amber.health-authority",
    authority: "BcnAmb3Y1K8pN2vD7wL5qZ4tR6sM9cX0bJ3eH5fA2gT8",
    issued: 87,
    revoked: 2,
    reputation: 9770,
    tone: "from-rose-500 to-pink-600",
  },
  {
    icon: Users,
    name: "beacon.verifier",
    authority: "BcnVer4W2pM8nL3kY7qD5vR1tS9yC4bJ6eA0fH2gX5zT",
    issued: 341,
    revoked: 11,
    reputation: 9678,
    tone: "from-amber-500 to-orange-600",
  },
  {
    icon: Layers,
    name: "aina.contributor",
    authority: "BcnAin5R1yN4mK8pD6wL2qZ9tS3vC5bJ7eA1fH4gX0uT",
    issued: 45,
    revoked: 1,
    reputation: 9777,
    tone: "from-sky-500 to-cyan-600",
  },
  {
    icon: Hexagon,
    name: "proof-of-build",
    authority: "BcnPoB6T2qK8nL4mD1wR7vZ3yS9cC5bJ8eA2fH0gX6uM",
    issued: 208,
    revoked: 6,
    reputation: 9711,
    tone: "from-fuchsia-500 to-purple-600",
  },
];

export function SchemaGallery() {
  return (
    <section
      id="schemas"
      className="relative py-24 md:py-32 border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-4">
              Live devnet schemas
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
              Every schema is a public, replayable contract.
            </h2>
          </div>
          <p className="max-w-md text-zinc-400 leading-relaxed">
            Anyone can permissionlessly derive the PDA, inspect issuance and
            revocation counts, and compute a verifier's reputation from event
            history.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemas.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.tone} grid place-items-center shadow-lg`}
                >
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold tracking-tight truncate">
                    {s.name}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    {shortAddress(s.authority, 6, 6)}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <Meta label="Issued" value={s.issued.toString()} />
                <Meta label="Revoked" value={s.revoked.toString()} />
                <Meta
                  label="Reputation"
                  value={`${(s.reputation / 100).toFixed(1)}%`}
                  accent
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className={`mt-0.5 font-semibold tabular-nums ${
          accent ? "text-indigo-300" : "text-zinc-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
