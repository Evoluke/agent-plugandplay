import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Entenda como tratamos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 space-y-8">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p>
          Esta Política de Privacidade explica como a Evoluke trata dados pessoais em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
        </p>
        <h2 className="text-2xl font-semibold">Informações que coletamos</h2>
        <p>
          Coletamos informações que você nos fornece voluntariamente, como nome,
          e-mail e dados de contato. Também registramos automaticamente dados de
          navegação, como endereço IP e ações realizadas na plataforma.
        </p>
        <h2 className="text-2xl font-semibold">Uso das informações</h2>
        <p>
          Utilizamos os dados coletados para fornecer e melhorar nossos serviços,
          personalizar a sua experiência e cumprir obrigações legais ou
          regulatórias.
        </p>
        <h2 className="text-2xl font-semibold">Compartilhamento de dados</h2>
        <p>
          Podemos compartilhar dados com parceiros que nos auxiliam na operação da
          plataforma, sempre sujeitos a obrigações de confidencialidade e
          segurança. Não comercializamos dados pessoais.
        </p>
        <h2 className="text-2xl font-semibold">Seus direitos</h2>
        <p>
          Você tem direito a confirmar a existência de tratamento, acessar,
          corrigir, anonimizar, portar ou eliminar seus dados pessoais, além de
          revogar consentimentos. Para exercer seus direitos, contate
          <a href="mailto:privacidade@evoluke.com" className="text-teal-600 hover:underline">
            privacidade@evoluke.com
          </a>
          .
        </p>
        <h2 className="text-2xl font-semibold">Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas para proteger os dados
          pessoais contra acessos não autorizados e incidentes de segurança.
        </p>
        <h2 className="text-2xl font-semibold">Atualizações</h2>
        <p>
          Esta política pode ser atualizada periodicamente. Mudanças relevantes
          serão comunicadas por nossos canais oficiais.
        </p>
        <h2 className="text-2xl font-semibold">Contato</h2>
        <p>
          Se tiver dúvidas ou solicitações sobre esta Política de Privacidade,
          envie um e-mail para
          <a href="mailto:privacidade@evoluke.com" className="text-teal-600 hover:underline">
            privacidade@evoluke.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}

