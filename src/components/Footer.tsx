import Link from "next/link";

const FOOTER_LINKS = [
  { label: "For parents & carers", href: "/companies" },
  { label: "For employers", href: "/employers" },
];

export function Footer() {
  return (
    <footer className="border-t border-warm-mid bg-white">
      <div className="flex flex-col gap-4 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-lg text-ink">copeepl</p>
        <nav className="flex flex-wrap gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-mid hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-ink-light">
          © {new Date().getFullYear()} Copeepl Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
