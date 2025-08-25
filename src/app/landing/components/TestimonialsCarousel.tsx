interface Testimonial {
  image: string;
  text: string;
}

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="depoimentos" className="py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-8 text-2xl font-bold">Depoimentos</h2>
        <div className="flex snap-x gap-6 overflow-x-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="snap-center min-w-full rounded border p-6">
              <img src={t.image} alt="" className="mx-auto h-16 w-16 rounded-full" />
              <p className="mt-4 text-sm">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
