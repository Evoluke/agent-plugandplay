"use client";

import { Users, MessageSquare, Bot } from "lucide-react";
import CountUp from "react-countup";

const stats = [
  { icon: Users, end: 130, label: "Leads/dia" },
  { icon: MessageSquare, end: 2200, label: "Mensagens/dia" },
  { icon: Bot, end: 35, label: "Agentes IA" },
];

export default function Stats() {
  return (
    <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <div className="grid grid-cols-3 gap-3 text-center sm:gap-6">
          {stats.map(({ icon: Icon, end, label }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className="mb-1 h-6 w-6 text-primary sm:mb-2 sm:h-8 sm:w-8" />
              <p className="text-2xl font-bold sm:text-3xl">
                <CountUp end={end} duration={2} enableScrollSpy scrollSpyOnce />+
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

