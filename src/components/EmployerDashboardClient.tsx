"use client";

import { useState } from "react";
import { EmployerDashboard } from "@/components/EmployerDashboard";
import type { MockCompany } from "@/lib/mock-data";

interface PendingReview {
  id: string;
  quote: string;
}

const INITIAL_PENDING: PendingReview[] = [
  { id: "p1", quote: "Flexible working was easy to arrange once I asked." },
  { id: "p2", quote: "Management didn't really understand what I needed after coming back." },
];

export function EmployerDashboardClient({ company }: { company: MockCompany }) {
  const [pendingReviews, setPendingReviews] = useState(INITIAL_PENDING);

  return (
    <EmployerDashboard
      companyName={company.name}
      verified={company.verified}
      renewalDue={company.renewalDue}
      renewalHref="/employers/assessment"
      metrics={{
        trustScore: company.score,
        totalReviews: company.reviewCount,
        recommendPercent: company.recommendPercent,
        profileViews: company.profileViews,
      }}
      pillars={company.pillars}
      pendingReviews={pendingReviews}
      onApprove={(id) => setPendingReviews((prev) => prev.filter((review) => review.id !== id))}
      onFlag={(id) => setPendingReviews((prev) => prev.filter((review) => review.id !== id))}
    />
  );
}
