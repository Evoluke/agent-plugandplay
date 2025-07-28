// src/components/ui/progress.tsx

import React from "react";

interface ProgressProps {
  value: number; // 0–100
}

export function Progress({ value }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          backgroundColor: "#3b82f6"
        }}
      />
    </div>
  );
}
