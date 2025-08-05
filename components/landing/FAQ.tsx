const faqs = [
  {
    q: "Como começo a usar a plataforma?",
    a: "Basta criar uma conta gratuita e conectar seus canais preferidos.",
  },
  {
    q: "Posso integrar com outros sistemas?",
    a: "Sim, oferecemos API e integrações nativas com CRM e outros serviços.",
  },
  {
    q: "Existe período de teste?",
    a: "Sim, todos os planos possuem 14 dias gratuitos para avaliação.",
  },
  {
    q: "Os dados dos meus clientes estão seguros?",
    a: "Utilizamos criptografia e seguimos as melhores práticas de segurança.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Nossa equipe está disponível por chat e e-mail em horário comercial.",
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

