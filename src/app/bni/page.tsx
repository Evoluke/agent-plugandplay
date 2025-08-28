import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BNI",
  description: "Conteúdo incorporado do BNI",
};

export default function BniPage() {
  return (
    <iframe
      src="https://difyplatform.tracelead.com.br/chatbot/pvKADqaaY0eWXy68"
      title="iframe"
      style={{ width: "100%", height: "100%", minHeight: "700px" }}
      frameBorder={0}
      allow="microphone"
      className="border-0"
    />
  );
}
