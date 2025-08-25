export default function LogosMarquee({ logos }: { logos: string[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">Clientes</h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {logos.map((logo) => (
            <img key={logo} src={logo} alt="logo" className="h-12" />
          ))}
        </div>
      </div>
    </section>
  );
}
