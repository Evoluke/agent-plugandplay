// src/app/dashboard/layout.tsx

"use client";

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}
