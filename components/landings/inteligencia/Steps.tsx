"use client";

const steps = [
  {
    title: "1º Coleta de informações",
    description: "Entendemos seu negócio e objetivos.",
  },
  {
    title: "2º Teste",
    description: "Validamos o comportamento do agente com seus dados.",
  },
  {
    title: "3º Integração",
    description: "Conectamos o assistente ao seu WhatsApp.",
  },
  {
    title: "4º Contratação",
    description: "Finalize a assinatura e comece a usar.",
  },
];

export default function Steps() {
  return (
    <section className="bg-[#FAFAFA] py-12 md:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center space-y-8">
        <h2 className="text-3xl font-bold">
          Configuramos tudo para você em 4 passos
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title, description }) => (
            <div key={title} className="space-y-2">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

