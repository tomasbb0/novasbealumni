import { brand } from "@/lib/brand";
import { TallyEmbed } from "@/components/TallyEmbed";

export const metadata = { title: "Survey" };

export default function SurveyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <div className="text-xs uppercase tracking-widest text-[color:var(--primary)]">
        2 minutes, no signup
      </div>
      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
        What should this community actually be?
      </h1>
      <p className="mt-4 text-[color:var(--muted)]">
        Your answers shape the first 6 months: format, frequency, who we
        prioritise, what kind of intros we make.
      </p>
      <div className="mt-10">
        <TallyEmbed formId={brand.tallySurveyId} title={`${brand.shortName} survey`} minHeight={720} />
      </div>
    </div>
  );
}
