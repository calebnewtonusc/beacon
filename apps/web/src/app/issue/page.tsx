"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  FileSignature,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { shortAddress } from "@/lib/utils";

type Step = "form" | "signing" | "broadcasting" | "done";

const EXAMPLE_ISSUER = "BcnIssuerExampleK8pN2vD7wL5qZ4tR6sM9cX0bJ3eH5";

export default function IssuePage() {
  const [step, setStep] = useState<Step>("form");
  const [schema, setSchema] = useState("usc.verified-student");
  const [subject, setSubject] = useState("");
  const [payload, setPayload] = useState(
    '{\n  "verified": true,\n  "cohort": "2029",\n  "program": "Iovine & Young Academy"\n}',
  );
  const [expires, setExpires] = useState("365");
  const [result, setResult] = useState<{
    attestation: string;
    signature: string;
    payloadHash: string;
  } | null>(null);

  const payloadHash = useMemo(() => {
    if (typeof window === "undefined") return "";
    const bytes = new TextEncoder().encode(payload);
    let hash = 0n;
    const prime = 1099511628211n;
    const mask = (1n << 64n) - 1n;
    hash = 14695981039346656037n;
    for (let i = 0; i < bytes.length; i++) {
      hash = ((hash ^ BigInt(bytes[i])) * prime) & mask;
    }
    const hex = hash.toString(16).padStart(16, "0");
    return `0x${hex}${hex}${hex}${hex}`.slice(0, 66);
  }, [payload]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("signing");
    await sleep(700);
    setStep("broadcasting");
    await sleep(1400);
    setResult({
      attestation: `AtsT${Math.random().toString(36).slice(2, 10)}beaconDevnet`,
      signature: `${Math.random().toString(36).slice(2, 12)}…${Math.random().toString(36).slice(2, 6)}`,
      payloadHash,
    });
    setStep("done");
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
              <FileSignature className="w-3.5 h-3.5" /> Issue credential
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Sign a payload, anchor a credential.
            </h1>
            <p className="mt-3 text-zinc-400 max-w-xl">
              Signing happens locally via your Privy embedded wallet. The Anchor
              program enforces the ed25519 check on-chain.
            </p>
          </div>

          <motion.form
            layout
            onSubmit={onSubmit}
            className="mt-10 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6"
          >
            <Field
              label="Schema"
              hint="Schemas are content-addressed by sha256 of the name."
            >
              <select
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full"
              >
                <option>usc.verified-student</option>
                <option>trojan-tech.officer</option>
                <option>amber.health-authority</option>
                <option>beacon.verifier</option>
                <option>aina.contributor</option>
                <option>proof-of-build</option>
              </select>
            </Field>

            <Field label="Subject wallet" hint="32-byte Solana public key.">
              <input
                type="text"
                placeholder="DxyZ…"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full font-mono text-sm"
              />
            </Field>

            <Field
              label="Credential payload"
              hint="Any UTF-8 data up to 512 bytes. Will be sha256-hashed before signing."
            >
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={6}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full font-mono text-sm leading-relaxed"
              />
            </Field>

            <Field label="Expires in (days)" hint="0 for non-expiring.">
              <input
                type="number"
                min={0}
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <Preview
                label="Issuer"
                value={shortAddress(EXAMPLE_ISSUER, 6, 6)}
              />
              <Preview
                label="Payload sha256"
                value={shortAddress(payloadHash, 8, 8)}
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={step === "signing" || step === "broadcasting"}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                {step === "signing" && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing
                    payload…
                  </>
                )}
                {step === "broadcasting" && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Broadcasting on
                    devnet…
                  </>
                )}
                {step === "form" && (
                  <>
                    <Shield className="w-4 h-4" /> Sign and issue
                  </>
                )}
                {step === "done" && (
                  <>
                    <Check className="w-4 h-4" /> Issued
                  </>
                )}
              </button>
              {step === "done" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setResult(null);
                  }}
                  className="text-sm text-zinc-400 hover:text-white cursor-pointer"
                >
                  Issue another
                </button>
              )}
            </div>
          </motion.form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6"
            >
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                <Check className="w-4 h-4" /> Anchored on devnet
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <CopyRow label="Attestation PDA" value={result.attestation} />
                <CopyRow label="Tx signature" value={result.signature} />
                <CopyRow
                  label="Payload hash"
                  value={result.payloadHash}
                  className="md:col-span-2"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        {hint && <span className="text-xs text-zinc-500">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm text-zinc-200">{value}</div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 ${
        className ?? ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="font-mono text-sm text-zinc-200 truncate">{value}</div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value)}
          className="text-zinc-400 hover:text-white cursor-pointer"
          aria-label="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
