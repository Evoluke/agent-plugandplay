export const FAQ_ITEMS = [
  {
    q: "O que é a Evoluke?",
    a: "Nossa tecnologia combina agentes de inteligência artificial que entendem as particularidades do seu negócio. Ao funcionar junto a uma plataforma de CRM multicanal, esses agentes automatizam o atendimento de maneira integrada. Isso permite processos mais eficientes e um relacionamento com clientes que cresce de forma inteligente e escalável.",
  },
  {
    q: "O que está incluso?",
    a: "Você conta com a plataforma de CRM Multicanal e, é claro, com Agentes de IA personalizados de acordo com as necessidades da sua empresa.",
  },
  {
    q: "Como funciona?",
    a: "Cadastre-se na plataforma, crie seu agente de IA e personalize-o com as características da sua empresa. Após o pagamento, você terá acesso ao nosso CRM Omnichannel e ao seu agente de IA, pronto para atender seus clientes.",
  },
];

export default function FAQ() {
  return (
    <section className="py-8 md:py-12 lg:py-16" id="faq">
      <div className="mx-auto max-w-[920px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="rounded-md border p-4">
              <summary className="cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

