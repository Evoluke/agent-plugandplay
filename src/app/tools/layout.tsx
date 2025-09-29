import type { ReactNode } from "react";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
