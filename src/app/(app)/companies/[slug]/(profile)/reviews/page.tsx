import { notFound } from "next/navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { DividerLabel } from "@/components/DividerLabel";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return (
    <div className="bg-warm px-8 py-8">
      <DividerLabel>All {company.reviewCount.toLocaleString()} reviews</DividerLabel>
      {company.reviews.map((review) => (
        <ReviewCard
          key={review.id}
          reviewerName={review.reviewerName}
          reviewerType={review.reviewerType}
          linkedInVerified={review.linkedInVerified}
          quote={review.quote}
          sentiment={review.sentiment}
        />
      ))}
    </div>
  );
}
