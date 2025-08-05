"use client";

const faqs = [
  {
    question: "Como funciona a plataforma?",
    answer:
      "Nossa solução integra múltiplos canais e utiliza IA para agilizar seu atendimento.",
  },
  {
    question: "Posso testar antes de assinar?",
    answer: "Sim, oferecemos um plano gratuito para você experimentar.",
  },
  {
    question: "Há suporte 24/7?",
    answer: "Planos pagos incluem suporte 24 horas por dia, 7 dias por semana.",
  },
  {
    question: "Como cancelar a assinatura?",
    answer: "Você pode cancelar a qualquer momento diretamente no painel.",
  },
  {
    question: "Quais formas de pagamento aceitam?",
    answer: "Aceitamos cartões de crédito e boleto bancário.",
  },
];

export default function FAQ() {
  return (
    <section className="py-8 md:py-12 lg:py-16" id="faq">
      <div className="mx-auto w-full max-w-[920px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {faqs.map(({ question, answer }) => (
            <details
              key={question}
              className="rounded-md border p-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {question}
                <span className="ml-2">▾</span>
              </summary>
              <div className="mt-2 border-t pt-2 text-sm text-muted-foreground">
                {answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

