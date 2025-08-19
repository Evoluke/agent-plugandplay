"use client";

import { Users, MessageSquare, Bot } from "lucide-react";
import CountUp from "react-countup";

const stats = [
  { icon: Users, end: 500, label: "Clientes" },
  { icon: MessageSquare, end: 1200, label: "Mensagens/dia" },
  { icon: Bot, end: 35, label: "Agentes IA" },
];

export default function Stats() {
  return (
    <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <div className="grid gap-6 text-center sm:grid-cols-3">
          {stats.map(({ icon: Icon, end, label }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className="mb-2 h-8 w-8 text-primary" />
              <p className="text-3xl font-bold">
                <CountUp end={end} duration={2} />+
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

