"use client";

import { useState } from "react";
import Image from "next/image";
import { IFRAME_SRC } from "./iframeConfig";

export default function FloatingIframeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50"
        aria-label="Abrir iframe"
      >
        <Image src="/iframe_contato.png" alt="Abrir iframe" width={64} height={64} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative h-5/6 w-11/12 max-w-3xl overflow-hidden rounded-md bg-background">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 text-2xl leading-none"
              aria-label="Fechar iframe"
            >
              ×
            </button>
            <iframe
              src={IFRAME_SRC}
              title="iframe"
              style={{ width: "100%", height: "100%" }}
              frameBorder={0}
              allow="microphone"
              className="border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}

