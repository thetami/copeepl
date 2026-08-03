import { notFound } from "next/navigation";
import { PillarBars } from "@/components/PillarBars";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyAssessmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  if (!company.verified) {
    return (
      <div className="bg-warm p-8">
        <div className="rounded-card border border-warm-mid bg-white p-8 text-center">
          <p className="font-serif text-xl text-ink">No assessment yet</p>
          <p className="mt-2 text-sm text-ink-light">
            {company.name} hasn&apos;t completed a Family Trust Score assessment as a
            Verified Employer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm p-8">
      <div className="rounded-card border border-warm-mid bg-white p-5">
        <h2 className="font-serif text-2xl text-ink">Employer self-assessment</h2>
        <p className="mt-1 text-sm text-ink-light">
          Scores below reflect {company.name}&apos;s own reported policies, weighted
          alongside employee reviews in the pillar scores.
        </p>
        <div className="mt-6">
          <PillarBars pillars={company.pillars} />
        </div>
      </div>
    </div>
  );
}
