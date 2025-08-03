// src/app/dashboard/payments/[id]/layout.tsx
"use client";

import React from "react";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <div className="mx-auto max-w-3xl p-4">
      {children}
    </div>
  );
}
