"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Calculator, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CalculatorResult = {
  totalCost: number;
  suggestedPrice: number;
  realMargin: number;
  unitProfit: number;
};

type FieldName = "directCost" | "allocatedExpenses" | "taxes" | "desiredMargin";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 2,
});

function sanitizeNumber(value: string) {
  return Number(value.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, "."));
}

export function MarginCalculatorForm() {
  const [fields, setFields] = useState<Record<FieldName, string>>({
    directCost: "",
    allocatedExpenses: "",
    taxes: "",
    desiredMargin: "",
  });
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isButtonDisabled = useMemo(
    () =>
      fields.directCost.trim() === "" ||
      fields.allocatedExpenses.trim() === "" ||
      fields.taxes.trim() === "" ||
      fields.desiredMargin.trim() === "",
    [fields]
  );

  const handleInputChange = (name: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    setFields((current) => ({
      ...current,
      [name]: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const directCost = sanitizeNumber(fields.directCost);
    const allocatedExpenses = sanitizeNumber(fields.allocatedExpenses);
    const taxes = sanitizeNumber(fields.taxes);
    const desiredMarginPercentage = sanitizeNumber(fields.desiredMargin);

    if ([directCost, allocatedExpenses, taxes, desiredMarginPercentage].some(Number.isNaN)) {
      setErrorMessage("Preencha todos os campos com números válidos.");
      setResult(null);
      return;
    }

    if (directCost <= 0) {
      setErrorMessage("O custo direto precisa ser um número positivo.");
      setResult(null);
      return;
    }

    if (allocatedExpenses < 0 || taxes < 0) {
      setErrorMessage("Despesas e impostos não podem ser negativos.");
      setResult(null);
      return;
    }

    if (desiredMarginPercentage < 0) {
      setErrorMessage("Informe uma margem desejada positiva.");
      setResult(null);
      return;
    }

    if (desiredMarginPercentage >= 100) {
      setErrorMessage("A margem precisa ser menor que 100%.");
      setResult(null);
      return;
    }

    const desiredMargin = desiredMarginPercentage / 100;
    const totalCost = directCost + allocatedExpenses + taxes;
    const suggestedPrice = totalCost / (1 - desiredMargin);
    const unitProfit = suggestedPrice - totalCost;
    const realMargin = unitProfit / suggestedPrice;

    setResult({ totalCost, suggestedPrice, unitProfit, realMargin });
    setErrorMessage(null);
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16 sm:py-20">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          <span className="text-primary font-semibold uppercase tracking-wide">Ferramenta gratuita</span>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Calculadora de margem: descubra o preço certo em segundos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Informe o custo direto, despesas alocadas, impostos e a margem desejada para calcular automaticamente o preço de venda
            recomendado. O resultado mostra a margem real e o lucro unitário para facilitar sua decisão de precificação.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Precificação inteligente
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1">
              <Percent className="h-4 w-4" aria-hidden="true" />
              Margem real em tempo real
            </span>
          </div>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Simule sua margem agora</CardTitle>
            <CardDescription>
              Todos os campos aceitam valores decimais com vírgula ou ponto. Informe a margem como percentual (ex.: 20 para 20%).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="directCost" className="text-sm font-medium text-foreground">
                  Custo direto (R$)
                </label>
                <Input
                  id="directCost"
                  inputMode="decimal"
                  value={fields.directCost}
                  onChange={handleInputChange("directCost")}
                  placeholder="Ex.: 1200,50"
                  required
                />
              </div>
              <div>
                <label htmlFor="allocatedExpenses" className="text-sm font-medium text-foreground">
                  Despesas fixas alocadas (R$)
                </label>
                <Input
                  id="allocatedExpenses"
                  inputMode="decimal"
                  value={fields.allocatedExpenses}
                  onChange={handleInputChange("allocatedExpenses")}
                  placeholder="Ex.: 350,00"
                  required
                />
              </div>
              <div>
                <label htmlFor="taxes" className="text-sm font-medium text-foreground">
                  Impostos ou tributos (R$)
                </label>
                <Input
                  id="taxes"
                  inputMode="decimal"
                  value={fields.taxes}
                  onChange={handleInputChange("taxes")}
                  placeholder="Ex.: 180,75"
                  required
                />
              </div>
              <div>
                <label htmlFor="desiredMargin" className="text-sm font-medium text-foreground">
                  Margem desejada (%)
                </label>
                <Input
                  id="desiredMargin"
                  inputMode="decimal"
                  value={fields.desiredMargin}
                  onChange={handleInputChange("desiredMargin")}
                  placeholder="Ex.: 20"
                  required
                />
              </div>
              {errorMessage ? <p className="text-sm font-semibold text-destructive">{errorMessage}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={isButtonDisabled}>
                Calcular preço sugerido
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {result ? (
        <Card className="border-primary/20 bg-primary/5 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-primary">
              Resultado da precificação
            </CardTitle>
            <CardDescription>
              Utilize os valores para ajustar ofertas, negociar com fornecedores ou apresentar projeções em propostas comerciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="text-sm text-muted-foreground">Preço sugerido</span>
              <p className="text-2xl font-bold text-foreground">{currencyFormatter.format(result.suggestedPrice)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Margem real</span>
              <p className="text-2xl font-bold text-foreground">{percentFormatter.format(result.realMargin)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Lucro unitário</span>
              <p className="text-2xl font-bold text-foreground">{currencyFormatter.format(result.unitProfit)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-primary/20 bg-card/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Potencialize seus resultados</CardTitle>
          <CardDescription>
            Salve os cálculos ao fazer login e conheça o plano premium para testar precificação em massa, cenários automáticos e
            relatórios financeiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="/login">Entrar para salvar simulações</a>
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="/pricing">Conhecer plano premium</a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
