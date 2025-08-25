interface Step { title: string }

export default function OnboardingSteps({ steps }: { steps: Step[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">Implementação em 4 passos</h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded border p-4 text-center">
              <div className="mb-2 text-3xl font-bold">{index + 1}</div>
              <p className="text-sm">{step.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
