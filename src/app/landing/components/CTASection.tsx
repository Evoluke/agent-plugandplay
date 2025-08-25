interface CTA {
  title: string;
  href: string;
}

export default function CTASection({ cta }: { cta: CTA }) {
  return (
    <section className="py-16 text-center">
      <h2 className="mb-4 text-2xl font-bold">{cta.title}</h2>
      <a
        href={cta.href}
        target="_blank"
        className="inline-block rounded bg-green-600 px-6 py-3 text-white"
      >
        WhatsApp
      </a>
    </section>
  );
}
