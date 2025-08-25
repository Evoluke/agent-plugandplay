interface FooterLink {
  label: string;
  href: string;
}

export default function Footer({ links }: { links: FooterLink[] }) {
  return (
    <footer className="bg-gray-900 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-sm">&copy; {new Date().getFullYear()}</p>
        <div className="flex gap-4">
          {links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" className="text-sm">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
