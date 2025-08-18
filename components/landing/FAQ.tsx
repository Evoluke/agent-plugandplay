const faqs = [
  {
    q: "O que é a Evoluke?",
    a: "Uma plataforma que une CRM omnichannel e inteligência artificial para otimizar seu atendimento.",
  },
  {
    q: "Posso integrar meus canais atuais?",
    a: "Sim. Conecte e-mail, chat, redes sociais e muito mais em um único lugar.",
  },
  {
    q: "A inteligência artificial aprende com meus atendimentos?",
    a: "Sim, ela se adapta às interações para responder com cada vez mais precisão.",
  },
  {
    q: "Vocês oferecem serviços sob demanda?",
    a: "Nossa equipe está disponível para implementar e personalizar soluções conforme a necessidade da sua empresa.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Utilizamos criptografia e seguimos as melhores práticas de segurança para proteger suas informações.",
  },
];

export default function FAQ() {
  return (
    <section className="py-8 md:py-12 lg:py-16" id="faq">
      <div className="mx-auto max-w-[920px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
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

