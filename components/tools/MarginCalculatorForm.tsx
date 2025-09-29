"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

type FormValues = {
  directCost: string;
  allocatedExpenses: string;
  taxes: string;
  desiredMargin: string;
  email: string;
};

type CalculationResult = {
  suggestedPrice: number;
  realMargin: number;
  unitProfit: number;
  totalCost: number;
};

const initialValues: FormValues = {
  directCost: "",
  allocatedExpenses: "",
  taxes: "",
  desiredMargin: "",
  email: "",
};

export default function MarginCalculatorForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  const handleChange = (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValues((prev) => ({
        ...prev,
        [field]: newValue,
      }));
      if (hasSubmitted) {
        resetResult();
      }
    };

  const premiumMessage = useMemo(
    () =>
      "Conheça o plano premium para simular cenários, automatizar listas de preços e exportar relatórios detalhados.",
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    const parsedDirectCost = Number.parseFloat(values.directCost.replace(",", "."));
    const parsedAllocatedExpenses = Number.parseFloat(values.allocatedExpenses.replace(",", "."));
    const parsedTaxes = Number.parseFloat(values.taxes.replace(",", "."));
    const parsedMargin = Number.parseFloat(values.desiredMargin.replace(",", "."));

    if ([parsedDirectCost, parsedAllocatedExpenses, parsedTaxes, parsedMargin].some((value) => Number.isNaN(value))) {
      setError("Preencha todos os campos com números válidos.");
      setResult(null);
      return;
    }

    if ([parsedDirectCost, parsedAllocatedExpenses, parsedTaxes].some((value) => value < 0)) {
      setError("Os valores precisam ser positivos.");
      setResult(null);
      return;
    }

    if (parsedMargin >= 100) {
      setError("A margem precisa ser menor que 100%.");
      setResult(null);
      return;
    }

    if (parsedMargin < 0) {
      setError("Informe uma margem desejada positiva.");
      setResult(null);
      return;
    }

    const desiredMarginDecimal = parsedMargin / 100;
    const totalCost = parsedDirectCost + parsedAllocatedExpenses + parsedTaxes;

    if (totalCost <= 0) {
      setError("Informe valores maiores que zero.");
      setResult(null);
      return;
    }

    const suggestedPrice = totalCost / (1 - desiredMarginDecimal);
    const unitProfit = suggestedPrice - totalCost;
    const realMargin = unitProfit / suggestedPrice;

    setResult({
      suggestedPrice,
      unitProfit,
      realMargin,
      totalCost,
    });
    setError(null);
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border bg-white/90 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row">
        <form className="w-full space-y-4 lg:w-1/2" onSubmit={handleSubmit} noValidate>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Calcule a precificação ideal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Descubra o preço de venda recomendado e identifique se sua margem de lucro está alinhada ao plano de crescimento da
              empresa.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-foreground">
              Custo direto (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.directCost}
                onChange={handleChange("directCost")}
                placeholder="Ex.: 150"
                aria-describedby="calculator-helper"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground">
              Despesas fixas alocadas (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.allocatedExpenses}
                onChange={handleChange("allocatedExpenses")}
                placeholder="Ex.: 35"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground">
              Impostos e tributos (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.taxes}
                onChange={handleChange("taxes")}
                placeholder="Ex.: 28"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground">
              Margem desejada (%)
              <Input
                required
                min="0"
                max="99.99"
                step="0.01"
                inputMode="decimal"
                value={values.desiredMargin}
                onChange={handleChange("desiredMargin")}
                placeholder="Ex.: 25"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col text-sm font-medium text-foreground">
              E-mail corporativo (opcional)
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="Receba dicas avançadas"
              />
            </label>
            <p className="text-xs text-muted-foreground" id="calculator-helper">
              Utilize vírgula ou ponto para casas decimais. Valores negativos não são aceitos.
            </p>
          </div>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full sm:w-auto">
            Calcular margens
          </Button>
        </form>
        <div className="w-full rounded-xl bg-muted/50 p-6 lg:w-1/2">
          <h3 className="text-xl font-semibold text-foreground">Resultados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Assim que preencher todos os campos, mostramos o preço ideal, a margem real e o lucro unitário estimado.
          </p>
          <div className="mt-6 min-h-[160px]">
            {result ? (
              <dl className="space-y-4 text-sm">
                <div className="flex items-baseline justify-between gap-4 rounded-lg bg-white/70 p-4 shadow-sm">
                  <dt className="font-medium text-foreground">Preço sugerido</dt>
                  <dd className="text-lg font-semibold text-primary">
                    {currencyFormatter.format(result.suggestedPrice)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 rounded-lg bg-white/70 p-4 shadow-sm">
                  <dt className="font-medium text-foreground">Margem real</dt>
                  <dd className="text-lg font-semibold text-primary">
                    {percentFormatter.format(result.realMargin)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 rounded-lg bg-white/70 p-4 shadow-sm">
                  <dt className="font-medium text-foreground">Lucro unitário</dt>
                  <dd className="text-lg font-semibold text-primary">
                    {currencyFormatter.format(result.unitProfit)}
                  </dd>
                </div>
                <p className="text-xs text-muted-foreground">
                  Custo total considerado: {currencyFormatter.format(result.totalCost)}.
                </p>
              </dl>
            ) : (
              <p className="rounded-lg border border-dashed border-muted-foreground/40 bg-white/60 p-6 text-center text-sm text-muted-foreground">
                Informe os custos e a margem desejada para visualizar automaticamente o potencial de lucro do seu produto.
              </p>
            )}
          </div>
          <div className="mt-6 space-y-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Plano premium</h4>
            <p className="text-sm text-muted-foreground">{premiumMessage}</p>
            <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/pricing">Quero conhecer o premium</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
