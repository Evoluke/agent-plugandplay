import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BNI",
  description: "Conteúdo incorporado do BNI",
};

export default function BniPage() {
  return (
    <iframe
      src="https://www.bni.com"
      className="w-full h-screen"
      frameBorder={0}
      allowFullScreen
    />
  );
}
