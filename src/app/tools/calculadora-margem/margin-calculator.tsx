"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

type CalculatorResult = {
  totalCost: number;
  suggestedPrice: number;
  realMargin: number;
  unitProfit: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const leadCopy = {
  title: "Transforme a calculadora em uma vantagem competitiva",
  description:
    "Cadastre-se para salvar históricos, exportar resultados e acessar recursos premium como precificação em massa, cenários avançados e relatórios automatizados.",
};

export function MarginCalculator() {
  const [directCost, setDirectCost] = useState("");
  const [allocatedExpenses, setAllocatedExpenses] = useState("");
  const [taxes, setTaxes] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadFeedback, setLeadFeedback] = useState<string | null>(null);

  const hasResult = useMemo(() => Boolean(result), [result]);

  const parseCurrency = (value: string) => {
    const sanitized = value.trim().replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const parsePercentage = (value: string) => {
    const sanitized = value.trim().replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const directCostValue = parseCurrency(directCost);
    const allocatedExpensesValue = parseCurrency(allocatedExpenses || "0");
    const taxesValue = parseCurrency(taxes || "0");
    const desiredMarginValue = parsePercentage(desiredMargin);

    if (
      [directCostValue, allocatedExpensesValue, taxesValue, desiredMarginValue].some(
        (value) => Number.isNaN(value) || value < 0,
      )
    ) {
      setError("Preencha todos os campos com números positivos. Utilize ponto ou vírgula para casas decimais.");
      setResult(null);
      return;
    }

    if (directCostValue === 0) {
      setError("O custo direto precisa ser maior que zero para gerar o preço de venda.");
      setResult(null);
      return;
    }

    if (desiredMarginValue >= 100) {
      setError("A margem desejada precisa ser menor que 100%.");
      setResult(null);
      return;
    }

    if (desiredMarginValue < 0) {
      setError("Informe uma margem desejada positiva.");
      setResult(null);
      return;
    }

    const desiredMarginRate = desiredMarginValue / 100;
    const totalCost = directCostValue + allocatedExpensesValue + taxesValue;
    const suggestedPrice = totalCost / (1 - desiredMarginRate);
    const unitProfit = suggestedPrice - totalCost;
    const realMargin = unitProfit / suggestedPrice;

    setResult({ totalCost, suggestedPrice, realMargin, unitProfit });
    setError(null);
  };

  const handleLeadSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leadEmail.trim()) {
      setLeadFeedback("Informe um e-mail válido para receber as novidades.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(leadEmail.trim())) {
      setLeadFeedback("E-mail inválido. Tente novamente usando um endereço corporativo.");
      return;
    }

    setLeadFeedback(
      "Obrigado! Em breve enviaremos conteúdos exclusivos sobre precificação e as próximas ferramentas premium.",
    );
    setLeadEmail("");
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">Preencha os custos para gerar o preço sugerido</CardTitle>
          <CardDescription>
            Consideramos custos diretos, despesas fixas alocadas e tributos para entregar a recomendação mais próxima da realidade
            do seu negócio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="direct-cost">
                Custo direto (R$)
              </label>
              <Input
                id="direct-cost"
                inputMode="decimal"
                placeholder="Ex.: 125,90"
                value={directCost}
                onChange={(event) => setDirectCost(event.target.value)}
                required
                aria-describedby="direct-cost-help"
              />
              <p id="direct-cost-help" className="text-xs text-muted-foreground">
                Some matéria-prima, mão de obra direta ou aquisição do produto.
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="allocated-expenses">
                Despesas fixas alocadas (R$)
              </label>
              <Input
                id="allocated-expenses"
                inputMode="decimal"
                placeholder="Ex.: 32,50"
                value={allocatedExpenses}
                onChange={(event) => setAllocatedExpenses(event.target.value)}
                aria-describedby="allocated-expenses-help"
              />
              <p id="allocated-expenses-help" className="text-xs text-muted-foreground">
                Rateio de aluguel, equipe administrativa, energia e outros custos indiretos do período.
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="taxes">
                Impostos ou tributos aplicáveis (R$)
              </label>
              <Input
                id="taxes"
                inputMode="decimal"
                placeholder="Ex.: 18,40"
                value={taxes}
                onChange={(event) => setTaxes(event.target.value)}
                aria-describedby="taxes-help"
              />
              <p id="taxes-help" className="text-xs text-muted-foreground">
                Inclua ICMS, ISS, PIS, COFINS ou outros encargos relacionados à venda.
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="desired-margin">
                Margem desejada (%)
              </label>
              <Input
                id="desired-margin"
                inputMode="decimal"
                placeholder="Ex.: 20"
                value={desiredMargin}
                onChange={(event) => setDesiredMargin(event.target.value)}
                required
                aria-describedby="desired-margin-help"
              />
              <p id="desired-margin-help" className="text-xs text-muted-foreground">
                Informe o percentual de lucro esperado sobre o preço final. Utilize números menores que 100.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="justify-center">
              Calcular preço sugerido
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasResult && result && (
        <Card className="border-primary/40 bg-primary/5 shadow-none">
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Resultado da precificação</CardTitle>
              <CardDescription>Utilize estes valores para ajustar catálogos, propostas e metas de vendas.</CardDescription>
            </div>
            <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground">Preço de venda sugerido</p>
              <p className="mt-2 text-2xl font-bold">{currencyFormatter.format(result.suggestedPrice)}</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground">Margem real estimada</p>
              <p className="mt-2 text-2xl font-bold">{percentageFormatter.format(result.realMargin)}</p>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground">Lucro unitário previsto</p>
              <p className="mt-2 text-2xl font-bold">{currencyFormatter.format(result.unitProfit)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={cn("shadow-none", hasResult ? "border-primary/30" : "border-border") }>
        <CardHeader className="gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-primary" aria-hidden />
            <div>
              <CardTitle className="text-xl">{leadCopy.title}</CardTitle>
              <CardDescription>{leadCopy.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleLeadSubmit} noValidate>
            <label className="sr-only" htmlFor="lead-email">
              E-mail corporativo
            </label>
            <Input
              id="lead-email"
              type="email"
              inputMode="email"
              placeholder="seuemail@empresa.com"
              value={leadEmail}
              onChange={(event) => {
                setLeadEmail(event.target.value);
                setLeadFeedback(null);
              }}
            />
            <Button type="submit" className="whitespace-nowrap">
              Quero liberar recursos premium
            </Button>
          </form>
          {leadFeedback && (
            <p className="mt-2 text-sm text-muted-foreground">{leadFeedback}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Ao se inscrever você concorda em receber comunicações da Evoluke. Você poderá cancelar a assinatura a qualquer
            momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
