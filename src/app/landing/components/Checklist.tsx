interface ChecklistItem {
  item: string;
  value: string;
}

export default function Checklist({
  comparison,
  benefits,
}: {
  comparison: ChecklistItem[];
  benefits: string[];
}) {
  return (
    <section id="planos" className="bg-gray-50 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Comparativo</h2>
          <ul className="space-y-2">
            {comparison.map((c) => (
              <li key={c.item} className="flex justify-between border-b pb-2 text-sm">
                <span>{c.item}</span>
                <span className="font-semibold">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Benefícios</h2>
          <ul className="space-y-2">
            {benefits.map((b) => (
              <li key={b} className="text-sm">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
