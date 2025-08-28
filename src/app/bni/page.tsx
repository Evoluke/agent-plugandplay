import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BNI",
  description: "Conteúdo incorporado do BNI",
};

export default function BniPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <iframe
        src="https://difyplatform.tracelead.com.br/chatbot/pvKADqaaY0eWXy68"
        title="iframe"
        allow="microphone"
        className="border-0 w-[60vw] h-[90vh]" // 60% da largura e 90% da altura da viewport
      />
    </div>
  );
}
