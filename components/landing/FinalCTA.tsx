import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="bg-[#0D0D0D] text-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center">
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Pronto para transformar seu atendimento?</h2>
          <p className="mt-2 text-lg font-medium text-primary">
            Ative hoje e veja resultados em minutos.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              Criar conta
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Falar com especialista
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

