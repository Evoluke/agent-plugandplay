import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Christiane",
    role: "Proprietária, Alecrim Flor & Cultura",
    text: "A Evoluke nos ajudou a escalar o atendimento sem perder qualidade.",
    avatar: "/logo.svg",
  },
  // {
  //   name: "João Souza",
  //   role: "Gerente, Loja Y",
  //   text: "Agora conseguimos responder clientes de todos os canais em um só lugar com a Evoluke.",
  //   avatar: "/logo.svg",
  // },
  // {
  //   name: "Ana Costa",
  //   role: "Suporte, Startup Z",
  //   text: "Os agentes de IA da Evoluke reduziram pela metade o volume de tickets manuais.",
  //   avatar: "/logo.svg",
  // },
];

export default function Testimonials() {
  const renderTestimonial = (t: (typeof testimonials)[0]) => (
    <Card key={t.name} className="h-full text-left">
      <CardContent className="space-y-4 pt-6">
        <div className="flex text-primary">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary" />
          ))}
        </div>
        <p className="text-sm">{t.text}</p>
        <div className="flex items-center gap-3">
          <Image
            src={t.avatar}
            alt={`Foto de ${t.name}`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-[#FAFAFA] py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center">
        <h2 className="text-3xl font-bold">Depoimentos</h2>
        <p className="mb-8 text-muted-foreground">Quem já utiliza a Evoluke</p>
        {testimonials.length === 1 ? (
          <div className="mx-auto max-w-md">
            {renderTestimonial(testimonials[0])}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => renderTestimonial(t))}
          </div>
        )}
      </div>
    </section>
  );
}

