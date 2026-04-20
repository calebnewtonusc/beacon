"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 p-10 md:p-16 text-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.35),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance max-w-2xl mx-auto">
              Issue your first credential in under five minutes.
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Connect a Privy embedded wallet, register a schema, sign a
              payload. The program does the rest.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/issue"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                Launch issuer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/calebnewtonusc/beacon"
                target="_blank"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-medium px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Github className="w-4 h-4" />
                Read the program
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
