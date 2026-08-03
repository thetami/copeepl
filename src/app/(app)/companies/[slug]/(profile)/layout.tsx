import { notFound } from "next/navigation";
import { CompanyProfileTabs } from "@/components/CompanyProfileTabs";
import { getCompanyBySlug } from "@/lib/mock-data";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm">
      <CompanyProfileTabs company={company} slug={slug} />
      {children}
    </div>
  );
}
