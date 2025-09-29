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
      "Conheça o plano premium para simular cenários, nutrir contatos com IA no WhatsApp e sincronizar decisões de preço com o CRM.",
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
    <section className="mx-auto w-full max-w-4xl rounded-3xl border bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <form className="w-full space-y-6 lg:w-1/2" onSubmit={handleSubmit} noValidate>
          <div>
            <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">Calcule a precificação ideal</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Descubra o preço de venda recomendado, dispare o fluxo de WhatsApp com IA e identifique se sua margem de lucro está
              alinhada ao plano de crescimento da empresa.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-foreground sm:text-base">
              Custo direto (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                enterKeyHint="next"
                value={values.directCost}
                onChange={handleChange("directCost")}
                placeholder="Ex.: 150"
                aria-describedby="calculator-helper"
                className="mt-2 h-12 rounded-xl border-muted/70 text-base shadow-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground sm:text-base">
              Despesas fixas alocadas (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                enterKeyHint="next"
                value={values.allocatedExpenses}
                onChange={handleChange("allocatedExpenses")}
                placeholder="Ex.: 35"
                className="mt-2 h-12 rounded-xl border-muted/70 text-base shadow-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground sm:text-base">
              Impostos e tributos (R$)
              <Input
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                enterKeyHint="next"
                value={values.taxes}
                onChange={handleChange("taxes")}
                placeholder="Ex.: 28"
                className="mt-2 h-12 rounded-xl border-muted/70 text-base shadow-sm"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-foreground sm:text-base">
              Margem desejada (%)
              <Input
                required
                min="0"
                max="99.99"
                step="0.01"
                inputMode="decimal"
                enterKeyHint="done"
                value={values.desiredMargin}
                onChange={handleChange("desiredMargin")}
                placeholder="Ex.: 25"
                className="mt-2 h-12 rounded-xl border-muted/70 text-base shadow-sm"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col text-sm font-medium text-foreground sm:text-base">
              E-mail corporativo (opcional)
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                enterKeyHint="send"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="Receba roteiros de automação no WhatsApp"
                className="mt-2 h-12 rounded-xl border-muted/70 text-base shadow-sm"
              />
            </label>
            <p className="text-xs text-muted-foreground sm:text-sm" id="calculator-helper">
              Utilize vírgula ou ponto para casas decimais. Valores negativos não são aceitos.
            </p>
          </div>
          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="h-12 w-full rounded-xl text-base sm:w-auto">
            Calcular margens e iniciar fluxo no WhatsApp
          </Button>
        </form>
        <div className="w-full rounded-3xl bg-muted/40 p-6 shadow-inner sm:p-8 lg:w-1/2">
          <h3 className="text-xl font-semibold text-foreground sm:text-2xl">Resultados</h3>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Assim que preencher todos os campos, mostramos o preço ideal, a margem real e o lucro unitário estimado.
          </p>
          <div className="mt-6 min-h-[180px]" aria-live="polite" aria-atomic="true">
            {result ? (
              <dl className="grid gap-4 text-sm sm:text-base">
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm sm:p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Preço sugerido</dt>
                  <dd className="mt-1 text-lg font-semibold text-primary sm:text-xl">
                    {currencyFormatter.format(result.suggestedPrice)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm sm:p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Margem real</dt>
                  <dd className="mt-1 text-lg font-semibold text-primary sm:text-xl">
                    {percentFormatter.format(result.realMargin)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm sm:p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Lucro unitário</dt>
                  <dd className="mt-1 text-lg font-semibold text-primary sm:text-xl">
                    {currencyFormatter.format(result.unitProfit)}
                  </dd>
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Custo total considerado: {currencyFormatter.format(result.totalCost)}.
                </p>
              </dl>
            ) : (
              <p className="rounded-2xl border border-dashed border-muted-foreground/40 bg-white/70 p-6 text-center text-sm text-muted-foreground sm:text-base">
                Informe os custos e a margem desejada para visualizar automaticamente o potencial de lucro do seu produto.
              </p>
            )}
          </div>
          <div className="mt-8 space-y-4 rounded-2xl border border-primary/40 bg-primary/10 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">Plano premium</h4>
            <p className="text-sm text-muted-foreground sm:text-base">{premiumMessage}</p>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-xl border-primary text-base text-primary hover:bg-primary hover:text-white"
            >
              <Link href="/pricing">Ativar automação WhatsApp + CRM premium</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
