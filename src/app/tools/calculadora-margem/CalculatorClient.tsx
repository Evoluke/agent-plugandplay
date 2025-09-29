"use client";

import { FormEvent, useMemo, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type CalculatorResult = {
  suggestedPrice: number;
  realMargin: number;
  unitProfit: number;
  totalCost: number;
};

type LeadStatus = "idle" | "saving" | "saved" | "error";

export default function CalculatorClient() {
  const [directCost, setDirectCost] = useState("");
  const [allocatedExpenses, setAllocatedExpenses] = useState("");
  const [taxes, setTaxes] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedDirectCost = parseLocaleNumber(directCost);
    const parsedAllocatedExpenses = parseLocaleNumber(allocatedExpenses);
    const parsedTaxes = parseLocaleNumber(taxes);
    const parsedMargin = parseLocaleNumber(desiredMargin);

    if (!email || !isValidEmail(email)) {
      setError("Informe um e-mail corporativo válido para receber o resumo da ferramenta.");
      return;
    }

    if ([parsedDirectCost, parsedAllocatedExpenses, parsedTaxes, parsedMargin].some((value) => value === null)) {
      setError("Preencha todos os campos com valores numéricos válidos.");
      return;
    }

    const direct = parsedDirectCost as number;
    const expenses = parsedAllocatedExpenses as number;
    const totalTaxes = parsedTaxes as number;
    const margin = parsedMargin as number;

    if ([direct, expenses, totalTaxes].some((value) => value < 0)) {
      setError("Os valores devem ser positivos ou iguais a zero.");
      return;
    }

    if (margin < 0) {
      setError("A margem desejada deve ser positiva ou igual a zero.");
      return;
    }

    if (margin >= 100) {
      setError("A margem precisa ser menor que 100%.");
      return;
    }

    const totalCost = direct + expenses + totalTaxes;
    const marginFraction = margin / 100;
    const suggestedPrice = totalCost / (1 - marginFraction);
    const unitProfit = suggestedPrice - totalCost;
    const realMargin = (unitProfit / suggestedPrice) * 100;

    const newResult: CalculatorResult = {
      suggestedPrice,
      realMargin,
      unitProfit,
      totalCost,
    };

    setResult(newResult);

    try {
      setLeadStatus("saving");
      const response = await fetch("/api/tools/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          toolSlug: "calculadora-margem",
          payload: {
            directCost: direct,
            allocatedExpenses: expenses,
            taxes: totalTaxes,
            desiredMargin: margin,
          },
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        console.error("Falha ao salvar lead da ferramenta:", data?.error);
        setLeadStatus("error");
        return;
      }

      setLeadStatus("saved");
    } catch (saveError) {
      console.error("Erro ao registrar lead da ferramenta", saveError);
      setLeadStatus("error");
    }
  };

  const emailFeedback = useMemo(() => {
    if (leadStatus === "saving") {
      return "Salvando seu contato...";
    }

    if (leadStatus === "saved") {
      return "Tudo certo! Enviaremos novidades sobre novas ferramentas e agentes de IA.";
    }

    if (leadStatus === "error") {
      return "Não conseguimos salvar seu contato agora. Seus resultados foram calculados mesmo assim.";
    }

    return null;
  }, [leadStatus]);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Preencha os dados da sua oferta</h2>
              <p className="mt-2 text-sm text-slate-600">
                Informe valores em reais e porcentagens para calcular o preço sugerido, a margem real e o lucro unitário previsto.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Custo direto"
                placeholder="Ex.: 1200"
                value={directCost}
                onChange={setDirectCost}
                prefix="R$"
                required
              />
              <InputField
                label="Despesas fixas alocadas"
                placeholder="Ex.: 350"
                value={allocatedExpenses}
                onChange={setAllocatedExpenses}
                prefix="R$"
                required
              />
              <InputField
                label="Impostos ou tributos"
                placeholder="Ex.: 180"
                value={taxes}
                onChange={setTaxes}
                prefix="R$"
                required
              />
              <InputField
                label="Margem desejada (%)"
                placeholder="Ex.: 20"
                value={desiredMargin}
                onChange={setDesiredMargin}
                suffix="%"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail corporativo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <p className="text-xs text-slate-500">
                Enviaremos um resumo da simulação e novidades sobre agentes de IA que automatizam a geração de receita.
              </p>
            </div>

            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {emailFeedback && !error && (
              <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{emailFeedback}</p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              disabled={leadStatus === "saving"}
            >
              {leadStatus === "saving" ? "Calculando..." : "Calcular preço sugerido"}
            </button>
          </form>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Por que conectar um agente de IA após definir sua margem?</h2>
          <ul className="space-y-4 text-sm leading-relaxed text-slate-600">
            <li>
              <strong className="text-slate-900">Consistência na oferta:</strong> o agente recomenda sempre o mesmo preço e argumentação, reduzindo descontos improvisados.
            </li>
            <li>
              <strong className="text-slate-900">Coleta de dados automatizada:</strong> ele captura volume, prazo e objeções, alimentando o CRM e validando sua estratégia de margens.
            </li>
            <li>
              <strong className="text-slate-900">Escala sem novos vendedores:</strong> campanhas e landing pages ganham atendimento imediato 24/7, mantendo a margem definida.
            </li>
            <li>
              <strong className="text-slate-900">Integração total com Evoluke:</strong> o agente agenda reuniões, envia propostas no formato correto e registra oportunidades qualificadas.
            </li>
          </ul>
        </div>
      </section>

      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-primary/10 via-white to-primary/10 p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">Resultados da simulação</h2>
        {result ? (
          <dl className="space-y-4 text-sm">
            <ResultRow label="Custo total" value={currencyFormatter.format(result.totalCost)} />
            <ResultRow label="Preço sugerido" value={currencyFormatter.format(result.suggestedPrice)} highlight />
            <ResultRow label="Margem real" value={percentFormatter.format(result.realMargin / 100)} />
            <ResultRow label="Lucro unitário" value={currencyFormatter.format(result.unitProfit)} />
          </dl>
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">
            Preencha os campos ao lado para descobrir imediatamente o preço de venda sugerido e entender se sua meta de margem está equilibrada com os custos.
          </p>
        )}

        {result && (
          <div className="rounded-2xl bg-white/80 p-4 text-xs leading-relaxed text-slate-500">
            <p>
              Utilize estes números para revisar descontos máximos, montar pacotes promocionais e alimentar previsões de receita. Caso precise de suporte, nossa equipe ajuda a treinar um agente Evoluke com base nestes dados.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function parseLocaleNumber(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

type InputFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  required?: boolean;
};

function InputField({ label, placeholder, value, onChange, prefix, suffix, required }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {prefix && <span className="font-semibold text-slate-500">{prefix}</span>}
        <input
          className="w-full border-none bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          placeholder={placeholder}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        />
        {suffix && <span className="font-semibold text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

type ResultRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function ResultRow({ label, value, highlight }: ResultRowProps) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${highlight ? "bg-primary/10 font-semibold text-primary" : "bg-white/70 text-slate-700"}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
