interface KPI {
  label: string;
  value: string;
}

export default function KPIList({ kpis }: { kpis: KPI[] }) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="space-y-2">
            <p className="text-3xl font-bold">{kpi.value}</p>
            <p className="text-sm">{kpi.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
