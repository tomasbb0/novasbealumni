import { brand } from "@/lib/brand";

export const metadata = { title: "Survey" };

export default function SurveyPage() {
  const isPlaceholder = brand.surveyUrl.includes("REPLACE_ME");
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

      <div className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
        {isPlaceholder ? (
          <div className="p-10 text-center">
            <div className="text-[color:var(--muted)] text-sm">
              Survey link not set yet.
            </div>
            <p className="mt-3 text-[color:var(--foreground)]">
              In the meantime, write us at{" "}
              <a
                href={`mailto:${brand.contactEmail}`}
                className="text-[color:var(--primary)] hover:underline"
              >
                {brand.contactEmail}
              </a>
              .
            </p>
          </div>
        ) : (
          <iframe
            src={brand.surveyUrl}
            className="w-full h-[80vh] border-0 bg-white"
            title="Nova Alumni NY survey"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
