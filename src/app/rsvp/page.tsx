import { brand } from "@/lib/brand";
import { RsvpForm } from "@/components/RsvpForm";

export const metadata = { title: "RSVP" };

export default function RsvpPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20">
      <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
        {brand.firstEvent.name}
      </div>
      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
        RSVP
      </h1>
      <p className="mt-4 text-[color:var(--muted)]">
        {brand.firstEvent.dateLabel} · {brand.firstEvent.venueLabel}.
        Drop your details and we&apos;ll send the invite + WhatsApp group link
        the moment we lock the date.
      </p>
      <div className="mt-10">
        <RsvpForm />
      </div>
    </div>
  );
}
