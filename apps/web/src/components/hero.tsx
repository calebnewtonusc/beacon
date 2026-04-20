"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CircleCheck, Github, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(99,102,241,0.22),rgba(10,10,10,0)_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:56px_56px] mask-fade-b opacity-30"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
            Live on Solana devnet · v0.1
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
          className="text-center text-5xl md:text-7xl font-bold tracking-tight text-balance max-w-4xl mx-auto leading-[1.04]"
        >
          On-chain reputation,{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
            verifiable by anyone
          </span>
          , owned by no one.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="mt-6 text-center text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Beacon is a soulbound attestation protocol. Issue revocable
          credentials to any wallet with an Anchor program, an ed25519-signed
          payload, and zero custodial trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/issue"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            Issue a credential
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://github.com/calebnewtonusc/beacon"
            target="_blank"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-medium px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            View source
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/50 rounded-2xl overflow-hidden border border-zinc-800"
        >
          <Stat label="Schemas registered" value="128" />
          <Stat label="Attestations issued" value="1,284" />
          <Stat label="Verifier wallets" value="342" />
          <Stat label="Avg. reputation" value="96.4%" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-500"
        >
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="w-4 h-4 text-indigo-400" />
            Soulbound by design
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="w-4 h-4 text-indigo-400" />
            Ed25519 payload verification
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck className="w-4 h-4 text-indigo-400" />
            Helius-indexed reputation graph
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" />
            Non-custodial
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950 px-6 py-5 text-center">
      <div className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}
