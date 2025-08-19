const steps = [
  {
    title: "Criação de agentes",
    description:
      "Configure agentes virtuais personalizados para responder aos seus clientes de acordo com as necessidades do seu negócio.",
  },
  {
    title: "Edição",
    description:
      "Edite fluxos e mensagens a qualquer momento, mantendo os agentes sempre alinhados às suas estratégias.",
  },
  {
    title: "Pagamento",
    description:
      "Gerencie planos e assinaturas diretamente na plataforma com faturamento transparente e seguro.",
  },
  {
    title: "Integração da IA",
    description:
      "Conecte modelos de inteligência artificial para automatizar atendimentos e entender o contexto de cada cliente.",
  },
  {
    title: "Acesso ao CRM",
    description:
      "Acompanhe todas as interações em um CRM integrado, garantindo uma visão completa do histórico de cada cliente.",
  },
];

export default function LearnMore() {
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h1 className="mb-4 text-3xl font-bold">Saiba Mais</h1>
        <p className="mb-8 text-muted-foreground">
          Conheça em detalhes como a Evoluke potencializa seu atendimento com IA e CRM integrados.
        </p>
        <div className="space-y-8">
          {steps.map(({ title, description }) => (
            <div key={title}>
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

