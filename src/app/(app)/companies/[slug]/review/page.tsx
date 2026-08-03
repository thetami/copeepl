import { notFound } from "next/navigation";
import { ReviewSubmissionFlow } from "@/components/ReviewSubmissionFlow";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return <ReviewSubmissionFlow companyName={company.name} companySlug={slug} />;
}
