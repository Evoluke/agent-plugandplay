// src/components/ui/BudgetCard.tsx

import React from "react";
import { Progress } from "./progress";
import { Bell } from "lucide-react"; // alert icon

interface Alert {
  threshold: number; // 0–100
  label: string;
}

interface BudgetCardProps {
  title?: string;
  periodLabel: string;
  spent: number;
  budget: number;
  resetInDays?: number;
  alerts?: Alert[];
  onAddAlert?: () => void;
  onEditBudget?: () => void;
}

export function BudgetCard({
  title = "Organization budget",
  periodLabel,
  spent,
  budget,
  resetInDays,
  alerts = [],
  onAddAlert,
  onEditBudget,
}: BudgetCardProps) {
  const percent = Math.min(100, (spent / budget) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="space-x-2">
          <button
            onClick={onAddAlert}
            className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
          >
            Add alert
          </button>
          <button
            onClick={onEditBudget}
            className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
          >
            Edit budget
          </button>
        </div>
      </header>

      <div className="text-sm text-gray-600 mb-1">{periodLabel}</div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-medium">R${spent.toFixed(2)}</span>
        <span className="text-sm text-gray-600">/ R${budget.toFixed(2)}</span>
      </div>

      <div className="relative mb-2">
        {/* base progress bar */}
        <Progress value={percent} />

        {/* threshold markers */}
        {alerts.map((a, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-gray-400"
            style={{ left: `${a.threshold}%` }}
          />
        ))}
      </div>

      {resetInDays != null && (
        <div className="text-xs text-gray-500 mb-4">
          Reseta em {resetInDays} dia{resetInDays > 1 ? "s" : ""}.
        </div>
      )}

      <ul className="divide-y">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-center py-2 text-sm">
            <Bell className="w-4 h-4 text-gray-500 mr-2" />
            <span>{a.threshold}% {a.label}</span>
          </li>
        ))}
        {alerts.length === 0 && (
          <li className="py-2 text-sm text-gray-500">No alerts set.</li>
        )}
      </ul>
    </div>
);
}
