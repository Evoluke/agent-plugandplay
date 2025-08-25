import React from "react";

export default function Video() {
  return (
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-[1140px] px-3 md:px-4 lg:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold">Veja em ação</h2>
        <div className="relative mx-auto w-full overflow-hidden rounded-lg shadow-lg" style={{paddingTop: "56.25%"}}>
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&rel=0&showinfo=0"
            title="Demonstração"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}

