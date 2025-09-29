"use client";

import Link from "next/link";
import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";

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

export default function CalculatorClient() {
  const [directCost, setDirectCost] = useState("");
  const [allocatedExpenses, setAllocatedExpenses] = useState("");
  const [taxes, setTaxes] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedDirectCost = parseLocaleNumber(directCost);
    const parsedAllocatedExpenses = parseLocaleNumber(allocatedExpenses);
    const parsedTaxes = parseLocaleNumber(taxes);
    const parsedMargin = parseLocaleNumber(desiredMargin);

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
  };

  return (
    <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg lg:col-start-1 lg:row-start-1">
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

            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              Calcular preço sugerido
            </button>
          </form>
      </section>

      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-primary/10 via-white to-primary/10 p-8 shadow-lg lg:col-start-2 lg:row-span-2">
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

        <div className="rounded-2xl border border-dashed border-primary/30 bg-white/60 p-3">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">Patrocinado</p>
          <GoogleAdsenseBanner />
        </div>
      </aside>

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg lg:col-start-1 lg:row-start-2">
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
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          Conheça a Evoluke
        </Link>
      </section>
    </div>
  );
}

function parseLocaleNumber(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

function GoogleAdsenseBanner() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const adsQueue = window.adsbygoogle ?? [];
      adsQueue.push({});
      window.adsbygoogle = adsQueue;
    } catch (error) {
      console.error("Erro ao carregar anúncio do Google Ads", error);
    }
  }, []);

  return (
    <>
      <Script
        id="adsbygoogle-tools-calculator"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: "80px" }}
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
