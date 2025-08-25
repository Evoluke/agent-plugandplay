interface Industry {
  name: string;
  desc: string;
}

export default function IndustryGrid({ industries }: { industries: Industry[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-2xl font-bold">Setores atendidos</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.name} className="rounded border p-4 text-center">
              <h3 className="font-semibold">{ind.name}</h3>
              <p className="text-sm">{ind.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
