import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

interface CTA {
  label: string;
  href: string;
}

export default function Header({ nav, cta }: { nav: NavItem[]; cta: CTA }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <nav className="flex space-x-4">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium">
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href={cta.href}
          className="rounded bg-green-600 px-4 py-2 text-white"
          target="_blank"
        >
          {cta.label}
        </Link>
      </div>
    </header>
  );
}
