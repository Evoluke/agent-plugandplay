"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Como funciona o período de teste?",
    a: "Você pode utilizar a plataforma gratuitamente por 14 dias com acesso completo aos recursos.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, você pode cancelar sua assinatura quando quiser sem taxas adicionais.",
  },
  {
    q: "Há suporte em português?",
    a: "Nossa equipe oferece suporte completo em português via chat e e-mail.",
  },
  {
    q: "Os dados estão seguros?",
    a: "Utilizamos criptografia e práticas modernas de segurança para proteger suas informações.",
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Aceitamos cartões de crédito das principais bandeiras e boletos bancários.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#FAFAFA]">
      <div className="mx-auto max-w-[920px] px-3 py-8 md:px-4 md:py-12 lg:px-6 lg:py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }, i) => (
            <div key={q} className="border rounded-lg">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {q}
                <span>{openIndex === i ? "-" : "+"}</span>
              </button>
              {openIndex === i && (
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

