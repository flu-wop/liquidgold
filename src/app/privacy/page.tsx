export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-4xl text-cocoa">Privacy Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-cocoa/70">
        <div>
          <p className="font-semibold text-cocoa">What we collect</p>
          <p className="mt-1">
            Name, email, shipping address, and order details when you place
            an order. Name, email, and message when you use the contact or
            wholesale forms.
          </p>
        </div>
        <div>
          <p className="font-semibold text-cocoa">Why</p>
          <p className="mt-1">
            To fulfill and ship your order, send confirmations, and respond
            to inquiries. We don&apos;t sell your information.
          </p>
        </div>
        <div>
          <p className="font-semibold text-cocoa">Where it lives</p>
          <p className="mt-1">
            Order and inquiry records are stored in our database (Turso).
            Payments are processed by Square — we never see or store your
            full card number. Emails are sent through Resend.
          </p>
        </div>
        <div>
          <p className="font-semibold text-cocoa">Who it's shared with</p>
          <p className="mt-1">
            Square (to process payment), Resend (to send order and inquiry
            emails). No one else.
          </p>
        </div>
        <div>
          <p className="font-semibold text-cocoa">Retention</p>
          <p className="mt-1">
            We keep order records until you ask us to delete them.
          </p>
        </div>
        <div>
          <p className="font-semibold text-cocoa">Questions or deletion requests</p>
          <p className="mt-1">
            Email{" "}
            <a href="mailto:liquidgoldskinco@gmail.com" className="text-guava underline underline-offset-2">
              liquidgoldskinco@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
