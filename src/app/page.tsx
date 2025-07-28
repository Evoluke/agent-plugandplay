// src/app/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md w-full">
        <Link href="/login">
          <Button className="w-full">Login</Button>
        </Link>
        <Link href="/signup">
          <Button className="w-full bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50">
            Cadastrar
          </Button>
        </Link>
      </div>
    </div>
  );
}