"use client";

import { usePathname, useRouter } from "next/navigation";
import { CompanyProfileHeader } from "@/components/CompanyProfileHeader";
import type { MockCompany } from "@/lib/mock-data";

const TAB_PATHS: Record<string, string> = {
  Overview: "",
  Reviews: "/reviews",
  Jobs: "/jobs",
  Assessment: "/assessment",
};

function getActiveTab(pathname: string, basePath: string) {
  const suffix = pathname.slice(basePath.length);
  const entry = Object.entries(TAB_PATHS).find(([, path]) => path === suffix);
  return entry ? entry[0] : "Overview";
}

interface CompanyProfileTabsProps {
  company: MockCompany;
  slug: string;
}

export function CompanyProfileTabs({ company, slug }: CompanyProfileTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = `/companies/${slug}`;
  const activeTab = getActiveTab(pathname, basePath);

  return (
    <CompanyProfileHeader
      name={company.name}
      industry={company.industry}
      employeeCount={company.employeeCount}
      verified={company.verified}
      parentRecommended={company.parentRecommended}
      reviewCount={company.reviewCount}
      activeTab={activeTab}
      onTabChange={(tab) => router.push(`${basePath}${TAB_PATHS[tab] ?? ""}`)}
    />
  );
}
