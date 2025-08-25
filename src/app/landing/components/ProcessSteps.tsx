interface Step {
  title: string;
  desc: string;
}

interface HowItWorks {
  intro: string;
  steps: Step[];
  ctaHref?: string;
}

export default function ProcessSteps({ data, ctaLabel }: { data: HowItWorks; ctaLabel: string }) {
  return (
    <section id="como-funciona" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-2xl font-bold">Como funciona</h2>
        <p className="mb-8 text-center text-sm">{data.intro}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {data.steps.map((step) => (
            <div key={step.title} className="rounded border bg-white p-4">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href={data.ctaHref}
            target="_blank"
            className="rounded bg-green-600 px-6 py-3 text-white"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
