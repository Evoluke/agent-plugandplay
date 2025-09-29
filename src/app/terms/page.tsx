import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Evoluke",
  description: "Termos de uso da plataforma Evoluke",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold">Termos de Uso</h1>
        <p>
          Bem-vindo aos Termos de Uso da Evoluke. Ao acessar ou utilizar nosso
          site e serviços, você concorda com as condições abaixo.
        </p>
        <h2 className="text-2xl font-semibold">1. Aceitação dos Termos</h2>
        <p>
          Ao utilizar a plataforma, você confirma que leu, entendeu e aceita
          estes Termos.
        </p>
        <h2 className="text-2xl font-semibold">2. Uso da Plataforma</h2>
        <p>
          Você se compromete a utilizar a Evoluke de forma legal e adequada,
          evitando atividades que possam prejudicar o funcionamento do serviço.
        </p>
        <h2 className="text-2xl font-semibold">3. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo disponibilizado é de propriedade da Evoluke ou de seus
          licenciadores.
        </p>
        <h2 className="text-2xl font-semibold">4. Limitação de Responsabilidade</h2>
        <p>
          A Evoluke não se responsabiliza por danos decorrentes do uso indevido
          da plataforma.
        </p>
        <h2 className="text-2xl font-semibold">5. Alterações</h2>
        <p>
          Podemos atualizar estes Termos a qualquer momento. Alterações
          significativas serão comunicadas através do site.
        </p>
        <h2 className="text-2xl font-semibold">6. Contato</h2>
        <p>
          Para dúvidas sobre estes Termos, entre em contato pelo e-mail
          contato@evoluke.com.br.
        </p>
      </main>
      <Footer />
    </>
  );
}

