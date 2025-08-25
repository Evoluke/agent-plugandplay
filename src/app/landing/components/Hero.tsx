import Link from "next/link";

interface HeroData {
  h1: string;
  bullets: string[];
  image: string;
}

interface CTA {
  label: string;
  href: string;
}

export default function Hero({ data, cta }: { data: HeroData; cta: CTA }) {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 py-24 md:flex-row">
      <div className="flex-1 space-y-4">
        <h1 className="text-4xl font-bold md:text-5xl">{data.h1}</h1>
        <ul className="space-y-2">
          {data.bullets.map((bullet) => (
            <li key={bullet} className="text-lg">
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          href={cta.href}
          className="inline-block rounded bg-green-600 px-6 py-3 text-white"
          target="_blank"
        >
          {cta.label}
        </Link>
      </div>
      <div className="flex-1">
        <img src={data.image} alt="banner" className="w-full" />
      </div>
    </section>
  );
}
