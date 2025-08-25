export default function StickyWhatsAppButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      className="fixed bottom-4 right-4 rounded-full bg-green-600 p-4 text-white shadow-lg"
    >
      WA
    </a>
  );
}
