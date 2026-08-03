import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustScoreBreakdown } from "@/components/TrustScoreBreakdown";
import { ReviewCard } from "@/components/ReviewCard";
import { DividerLabel } from "@/components/DividerLabel";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const highlightedReviews = company.reviews.slice(0, 2);

  return (
    <>
      <TrustScoreBreakdown
        score={company.score}
        reviewCount={company.reviewCount}
        recommendPercent={company.recommendPercent}
        pillars={company.pillars}
      />

      <div className="bg-warm px-8 pb-8">
        <DividerLabel>What parents say</DividerLabel>
        {highlightedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            reviewerName={review.reviewerName}
            reviewerType={review.reviewerType}
            linkedInVerified={review.linkedInVerified}
            quote={review.quote}
            sentiment={review.sentiment}
          />
        ))}
        {company.reviews.length > highlightedReviews.length && (
          <Link
            href={`/companies/${slug}/reviews`}
            className="text-[13px] font-medium text-teal-dark"
          >
            See all {company.reviewCount.toLocaleString()} reviews →
          </Link>
        )}
      </div>
    </>
  );
}
