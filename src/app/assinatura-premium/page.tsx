import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plano premium Currículo IA Pro",
  description: "Desbloqueie GPT-4.1, exportações ilimitadas, templates extras, tradução e carta de apresentação.",
};

export default function AssinaturaPremiumPage() {
  return (
    <div className="bg-neutral-50 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6">
        <h1 className="text-3xl font-semibold text-neutral-900">Plano premium Currículo IA Pro</h1>
        <p className="text-neutral-600">
          O plano premium habilita geração com GPT-4.1, cartas de apresentação sob medida, tradução instantânea para inglês, quatro layouts exclusivos e exportações ilimitadas sem marca d&apos;água.
        </p>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li>✔️ Múltiplos perfis salvos e histórico de exportações.</li>
          <li>✔️ Reescrita de bullets focada em ATS para cada vaga.</li>
          <li>✔️ Suporte prioritário com tempo de resposta em até 24h.</li>
        </ul>
        <Link
          href="/gerar-curriculo"
          className="mt-4 inline-flex w-fit items-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
        >
          Começar agora
        </Link>
      </div>
    </div>
  );
}
