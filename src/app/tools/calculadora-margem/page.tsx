import type { Metadata } from "next";

import { MetadataHeading } from "./metadata-heading";
import { MarginCalculator } from "./margin-calculator";

export const metadata: Metadata = {
  title: "Calculadora de margem de lucro e precificação | Evoluke",
  description:
    "Calcule o preço de venda ideal a partir dos custos diretos, despesas alocadas, impostos e margem desejada. Descubra a margem real e o lucro unitário em segundos.",
  keywords: [
    "calculadora de margem",
    "precificação",
    "preço de venda",
    "margem de lucro",
    "lucro unitário",
    "gestão financeira",
  ],
  alternates: {
    canonical: "/tools/calculadora-margem",
  },
};

export default function MarginCalculatorPage() {
  return (
    <div className="space-y-10">
      <MetadataHeading />
      <MarginCalculator />
    </div>
  );
}
