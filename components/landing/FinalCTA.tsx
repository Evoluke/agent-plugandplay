import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCTA() {
  return (
    <section className="bg-primary/10 py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6 text-center">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <p className="mb-6 text-muted-foreground">
          Experimente gratuitamente e veja os resultados.
        </p>
        <Link href="/signup">
          <Button size="lg">Criar conta</Button>
        </Link>
      </div>
    </section>
  );
}

