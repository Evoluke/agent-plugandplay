interface Agent {
  name: string;
  desc: string;
  icon: string;
}

export default function FeatureCards({ agents }: { agents: Agent[] }) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {agents.map((agent) => (
          <div key={agent.name} className="rounded border bg-white p-6 text-center">
            <img src={agent.icon} alt="" className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-xl font-semibold">{agent.name}</h3>
            <p className="mt-2 text-sm">{agent.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
