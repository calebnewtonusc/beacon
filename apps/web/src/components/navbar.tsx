"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useScrollNav } from "./use-scroll-nav";

export function Navbar() {
  const visible = useScrollNav();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/75 border-b border-zinc-800/60"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
            Beacon
          </span>
          <span className="hidden sm:inline text-xs text-zinc-500 ml-1">
            / protocol
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/#how">How it works</NavLink>
          <NavLink href="/#schemas">Schemas</NavLink>
          <NavLink href="/analytics">Analytics</NavLink>
          <NavLink href="/verify">Verify</NavLink>
          <NavLink href="https://github.com/calebnewtonusc/beacon" external>
            GitHub
          </NavLink>
        </div>

        <Link
          href="/issue"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 cursor-pointer text-sm"
        >
          Issue credential
        </Link>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="text-sm text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
    >
      {children}
    </Link>
  );
}
