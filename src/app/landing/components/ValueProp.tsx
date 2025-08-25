interface ValuePropData {
  title: string;
  text: string;
}

export default function ValueProp({ data }: { data: ValuePropData }) {
  return (
    <section className="py-16 text-center">
      <h2 className="text-2xl font-bold md:text-3xl">{data.title}</h2>
      <p className="mx-auto mt-4 max-w-3xl text-lg">{data.text}</p>
    </section>
  );
}
