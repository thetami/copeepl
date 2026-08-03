"use client";

import { useState } from "react";
import Link from "next/link";
import { ReviewForm } from "@/components/ReviewForm";

interface ReviewSubmissionFlowProps {
  companyName: string;
  companySlug: string;
}

export function ReviewSubmissionFlow({ companyName, companySlug }: ReviewSubmissionFlowProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-warm px-4 text-center">
        <p className="font-serif text-2xl text-ink">Thank you</p>
        <p className="max-w-sm text-ink-mid">
          Your review of {companyName} has been submitted and will appear once it&apos;s
          been checked.
        </p>
        <Link
          href={`/companies/${companySlug}`}
          className="mt-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-azure"
        >
          Back to {companyName}
        </Link>
      </div>
    );
  }

  return (
    <ReviewForm
      companyName={companyName}
      onSubmit={(answers) => {
        // Persistence lands in a follow-up task — for now this just advances the UI.
        console.log("review submitted", { companySlug, answers });
        setSubmitted(true);
      }}
    />
  );
}
