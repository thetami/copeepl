import Link from "next/link";

export default function EmployersLandingPage() {
  return (
    <main className="min-h-screen bg-warm">
      <div className="bg-azure px-8 py-16 text-center">
        <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.15em] text-teal">
          For employers
        </div>
        <h1 className="mx-auto mb-5 max-w-[520px] font-serif text-[42px] leading-[1.1] text-white">
          Show families you mean it
        </h1>
        <p className="mx-auto mb-8 max-w-[420px] text-[15px] font-light leading-[1.6] text-white/65">
          Get a Verified Employer badge backed by real reviews from parents and carers who
          actually work there — plus a self-reported policy assessment that feeds your Family
          Trust Score.
        </p>
        <Link
          href="/employers/dashboard"
          className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-azure"
        >
          Go to employer dashboard →
        </Link>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 px-8 py-10 sm:grid-cols-3">
        <div className="rounded-card border border-warm-mid bg-white p-5">
          <p className="mb-1 font-serif text-lg text-ink">Verified badge</p>
          <p className="text-sm text-ink-light">
            Complete the policy assessment and earn a Verified Employer badge on your profile.
          </p>
        </div>
        <div className="rounded-card border border-warm-mid bg-white p-5">
          <p className="mb-1 font-serif text-lg text-ink">Real reviews</p>
          <p className="text-sm text-ink-light">
            See what parents and carers on your team actually say, moderated in your dashboard.
          </p>
        </div>
        <div className="rounded-card border border-warm-mid bg-white p-5">
          <p className="mb-1 font-serif text-lg text-ink">Stand out</p>
          <p className="text-sm text-ink-light">
            Family Trust Scores help candidates who are parents or carers choose you first.
          </p>
        </div>
      </div>
    </main>
  );
}
