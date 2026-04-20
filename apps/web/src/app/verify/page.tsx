"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { shortAddress } from "@/lib/utils";

type VerifyResult = {
  status: "valid" | "revoked" | "expired" | "not_found";
  schema: string;
  issuer: string;
  subject: string;
  issuedAt: string;
  expiresAt: string | null;
  reputation: number;
  payloadHash: string;
};

const MOCK: VerifyResult = {
  status: "valid",
  schema: "usc.verified-student",
  issuer: "BcnAuth1K9v8yZxX7qL4pN2kT3M1vW0zF6sD5cB3a7eH9",
  subject: "7LxVmKgD5vQ2pN8mR4yK1tS9cC5bJ8eA2fH0gX6uMwR",
  issuedAt: "2026-04-12 18:32 UTC",
  expiresAt: "2027-04-12 18:32 UTC",
  reputation: 9927,
  payloadHash:
    "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
};

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 900));
    setResult(MOCK);
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Verifier
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Verify any credential permissionlessly.
            </h1>
            <p className="mt-3 text-zinc-400 max-w-xl">
              Paste an attestation PDA or a subject wallet. The indexer replays
              the on-chain event log and returns the current validity state.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10">
            <div className="flex items-stretch gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Attestation PDA or subject wallet"
                  className="bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                {loading ? "Verifying…" : "Verify"}
              </button>
            </div>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
            >
              <div
                className={`px-6 py-4 flex items-center gap-3 ${
                  result.status === "valid"
                    ? "bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-200"
                    : "bg-rose-500/10 border-b border-rose-500/20 text-rose-200"
                }`}
              >
                {result.status === "valid" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                <div className="font-semibold capitalize">{result.status}</div>
                <div className="ml-auto text-xs font-mono opacity-80">
                  reputation · {(result.reputation / 100).toFixed(2)}%
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <Row label="Schema" value={result.schema} />
                <Row
                  label="Issuer"
                  value={shortAddress(result.issuer, 8, 8)}
                  mono
                />
                <Row
                  label="Subject"
                  value={shortAddress(result.subject, 8, 8)}
                  mono
                />
                <Row label="Issued at" value={result.issuedAt} />
                <Row label="Expires at" value={result.expiresAt ?? "never"} />
                <Row
                  label="Payload sha256"
                  value={shortAddress(result.payloadHash, 8, 8)}
                  mono
                />
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                <Search className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="mt-4 text-sm text-zinc-400">
                Example: try{" "}
                <button
                  type="button"
                  onClick={() => setQuery(MOCK.subject)}
                  className="font-mono text-indigo-300 hover:text-indigo-200 cursor-pointer"
                >
                  {shortAddress(MOCK.subject, 6, 6)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className={`mt-1 text-sm text-zinc-100 ${
          mono ? "font-mono" : ""
        } break-all`}
      >
        {value}
      </div>
    </div>
  );
}
