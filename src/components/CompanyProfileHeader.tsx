"use client";

import { getInitials } from "@/lib/initials";

interface CompanyProfileHeaderProps {
  name: string;
  industry: string;
  employeeCount: string;
  verified: boolean;
  parentRecommended: boolean;
  logoInitials?: string;
  reviewCount?: number;
  jobCount?: number;
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

function buildTabs(reviewCount?: number, jobCount?: number) {
  return [
    { key: "Overview", label: "Overview" },
    { key: "Reviews", label: reviewCount !== undefined ? `Reviews (${reviewCount})` : "Reviews" },
    { key: "Jobs", label: jobCount !== undefined ? `Jobs (${jobCount})` : "Jobs" },
    { key: "Assessment", label: "Assessment" },
  ];
}

export function CompanyProfileHeader({
  name,
  industry,
  employeeCount,
  verified,
  parentRecommended,
  logoInitials,
  reviewCount,
  jobCount,
  activeTab,
  onTabChange,
}: CompanyProfileHeaderProps) {
  const tabs = buildTabs(reviewCount, jobCount);

  return (
    <header className="bg-azure px-8 pt-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white">
          <span className="font-serif text-[22px] text-azure">
            {logoInitials ?? getInitials(name)}
          </span>
        </div>

        <div>
          <h1 className="mb-1 font-serif text-[28px] text-white">{name}</h1>
          <p className="mb-2.5 text-[13px] text-white/60">
            {industry} · {employeeCount}
          </p>

          <div className="flex flex-wrap gap-2">
            {verified && (
              <span className="rounded-full bg-teal px-3 py-1 text-[11px] font-semibold text-azure">
                ✓ Verified Employer
              </span>
            )}
            {parentRecommended && (
              <span className="rounded-full bg-crimson/[0.18] px-3 py-1 text-[11px] font-medium text-crimson">
                ♥ Parent Recommended
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="mt-4 flex border-t border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange?.(tab.key)}
            className={`border-b-2 px-5 py-3 text-[13px] transition-colors ${
              tab.key === activeTab
                ? "border-teal text-teal"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
