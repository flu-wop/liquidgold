import Button from "@/components/ui/Button";

const reasons = [
  "Order Help",
  "General Questions",
  "Wholesale",
  "Collaborations/Partnerships",
  "Events",
  "Press/Content",
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa md:text-5xl">
        Get in <span className="text-gold-gradient italic">Touch</span>
      </h1>
      <p className="mt-3 text-cocoa/60">
        Prefer email? Reach us directly at{" "}
        <a
          href="mailto:liquidgoldskinco@gmail.com"
          className="text-guava underline underline-offset-2"
        >
          liquidgoldskinco@gmail.com
        </a>
        .
      </p>
      {/* PLACEHOLDER: form submit not wired yet — routes to Resend once
          the email/notification layer is built */}
      <form className="mt-10 space-y-4">
        <select className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm">
          {reasons.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <input placeholder="Name" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
        <input placeholder="Email" className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
        <textarea placeholder="Message" rows={5} className="w-full rounded-xl border border-cocoa/20 bg-cream px-4 py-3 text-sm" />
        <Button type="submit">Send Message</Button>
      </form>
    </section>
  );
}
