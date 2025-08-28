import React from "react";

export default function Video() {
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Veja em ação</h2>
        <div className="mx-auto w-full lg:w-[70%] aspect-video overflow-hidden rounded-lg shadow-lg">
          {/*
          <video
            className="h-full w-full object-cover"
            src="/demo.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          */}
          <iframe
            src="https://difyplatform.tracelead.com.br/chatbot/pvKADqaaY0eWXy68"
            title="iframe"
            style={{ width: "100%", height: "100%" }}
            frameBorder={0}
            allow="microphone"
            className="border-0"
          />
        </div>
      </div>
    </section>
  );
}

