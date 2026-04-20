import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-14 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center shadow-lg shadow-indigo-500/25">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Beacon</span>
          </Link>
          <p className="mt-4 text-sm text-zinc-400 max-w-sm leading-relaxed">
            An open, soulbound attestation protocol for Solana. Built for
            verifiers, researchers, and anyone who wants reputation without a
            platform.
          </p>
        </div>
        <Column
          title="Protocol"
          links={[
            { href: "/#how", label: "How it works" },
            { href: "/#schemas", label: "Schemas" },
            { href: "/analytics", label: "Analytics" },
            { href: "/verify", label: "Verify" },
          ]}
        />
        <Column
          title="Developers"
          links={[
            {
              href: "https://github.com/calebnewtonusc/beacon",
              label: "GitHub",
              external: true,
            },
            {
              href: "https://github.com/calebnewtonusc/beacon/tree/main/packages/sdk",
              label: "SDK",
              external: true,
            },
            {
              href: "https://github.com/calebnewtonusc/beacon/tree/main/programs/beacon",
              label: "Anchor program",
              external: true,
            },
          ]}
        />
      </div>
      <div className="mt-10 border-t border-zinc-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-zinc-500">
          <div>© {new Date().getFullYear()} Beacon Protocol. MIT licensed.</div>
          <div className="font-mono">Program: Bcn1111…1111 · Devnet</div>
        </div>
      </div>
    </footer>
  );
}

function Column({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
