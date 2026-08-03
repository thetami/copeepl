import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyJobsPage({
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
    <div className="bg-warm p-8">
      <div className="rounded-card border border-warm-mid bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink">Open roles coming soon</p>
        <p className="mt-2 text-sm text-ink-light">
          {company.name} hasn&apos;t listed any open roles here yet.
        </p>
      </div>
    </div>
  );
}
