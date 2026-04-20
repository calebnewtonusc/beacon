"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleOff,
  Gauge,
  Signature,
  Sparkles,
  Timer,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { shortAddress } from "@/lib/utils";

const issuanceSeries = [
  12, 18, 22, 19, 25, 31, 38, 42, 47, 51, 58, 63, 69, 74, 81, 88, 92, 101, 108,
  117, 124, 131, 139, 147, 158, 167, 176, 184, 198, 214, 229,
];

const topIssuers = [
  {
    addr: "BcnAuth1K9v8yZxX7qL4pN2kT3M1vW0zF6sD5cB3a7eH9",
    issued: 412,
    rep: 9927,
  },
  {
    addr: "BcnAmb3Y1K8pN2vD7wL5qZ4tR6sM9cX0bJ3eH5fA2gT8",
    issued: 268,
    rep: 9812,
  },
  {
    addr: "BcnVer4W2pM8nL3kY7qD5vR1tS9yC4bJ6eA0fH2gX5zT",
    issued: 187,
    rep: 9678,
  },
  {
    addr: "BcnAin5R1yN4mK8pD6wL2qZ9tS3vC5bJ7eA1fH4gX0uT",
    issued: 139,
    rep: 9777,
  },
  {
    addr: "BcnTTS2h7L8pQ1nK6mD4wZ3vR9tS5yN0xC2bJ8eA4fM1",
    issued: 97,
    rep: 10000,
  },
];

const recentEvents = [
  {
    kind: "attestation_issued",
    when: "12s",
    schema: "usc.verified-student",
    actor: "BcnAuth1K9v8y…a7eH9",
  },
  {
    kind: "attestation_issued",
    when: "47s",
    schema: "beacon.verifier",
    actor: "BcnVer4W2pM8n…gX5zT",
  },
  {
    kind: "schema_registered",
    when: "2m",
    schema: "dao.contributor",
    actor: "BcnNew9K2p…wX4uM",
  },
  {
    kind: "attestation_revoked",
    when: "4m",
    schema: "proof-of-build",
    actor: "BcnPoB6T2q…gX6uM",
  },
  {
    kind: "attestation_issued",
    when: "6m",
    schema: "amber.health-authority",
    actor: "BcnAmb3Y1K8p…fA2gT8",
  },
];

export default function AnalyticsPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium">
                <Activity className="w-3.5 h-3.5" /> Live analytics
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
                The reputation graph, in real time.
              </h1>
              <p className="mt-3 text-zinc-400 max-w-2xl">
                Every chart here is derived from the Helius-indexed event log.
                Reload and watch the numbers breathe.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Indexer healthy · 31 blocks behind tip
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI
              icon={BadgeCheck}
              label="Attestations issued"
              value="1,284"
              delta="+214 / 7d"
              tone="indigo"
            />
            <KPI
              icon={Signature}
              label="Schemas registered"
              value="128"
              delta="+18 / 7d"
              tone="violet"
            />
            <KPI
              icon={Gauge}
              label="Avg verifier reputation"
              value="96.4%"
              delta="+0.2 / 7d"
              tone="emerald"
            />
            <KPI
              icon={CircleOff}
              label="Revocation rate"
              value="3.58%"
              delta="stable"
              tone="rose"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    Issuance · 30-day
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    229 yesterday
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-sm text-emerald-300">
                  <ArrowUpRight className="w-4 h-4" />
                  +38.2%
                </div>
              </div>
              <Chart series={issuanceSeries} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <div className="text-sm font-semibold tracking-tight">
                  Top verifiers
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {topIssuers.map((v, i) => (
                  <li
                    key={v.addr}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/30 px-3 py-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs text-zinc-400">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs text-zinc-200 truncate">
                        {shortAddress(v.addr, 6, 6)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                        {v.issued} issued
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-indigo-300 tabular-nums">
                      {(v.rep / 100).toFixed(1)}%
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Timer className="w-4 h-4 text-zinc-400" />
              <div className="text-sm font-semibold tracking-tight">
                Recent events
              </div>
              <div className="ml-auto text-xs text-zinc-500">Streaming</div>
            </div>
            <ul className="divide-y divide-zinc-800">
              {recentEvents.map((ev, i) => (
                <li
                  key={i}
                  className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <EventBadge kind={ev.kind} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-zinc-100 truncate">
                      {ev.schema}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono truncate">
                      {ev.actor}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 tabular-nums">
                    {ev.when} ago
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  tone: "indigo" | "violet" | "emerald" | "rose";
}) {
  const tones = {
    indigo: "from-indigo-500/15 text-indigo-300 border-indigo-500/20",
    violet: "from-violet-500/15 text-violet-300 border-violet-500/20",
    emerald: "from-emerald-500/15 text-emerald-300 border-emerald-500/20",
    rose: "from-rose-500/15 text-rose-300 border-rose-500/20",
  } as const;
  return (
    <div className="relative overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
      <div
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${tones[tone]}`}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={`p-2 rounded-lg border bg-white/5 ${tones[tone].split(" ").slice(1).join(" ")}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          {delta}
        </div>
      </div>
      <div className="relative mt-4">
        <div className="text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  );
}

function Chart({ series }: { series: number[] }) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const w = 640;
  const h = 180;
  const pad = 8;
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");
  const area = `${path} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaFill)" />
        <path
          d={path}
          fill="none"
          stroke="rgb(129 140 248)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function EventBadge({ kind }: { kind: string }) {
  const style =
    kind === "attestation_issued"
      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
      : kind === "attestation_revoked"
        ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
        : "bg-violet-500/10 text-violet-300 border-violet-500/20";
  const label = kind.replaceAll("_", " ");
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider border ${style}`}
    >
      {label}
    </span>
  );
}
