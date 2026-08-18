import ContactForm from "./ContactForm";

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
      <ContactForm />
    </section>
  );
}
