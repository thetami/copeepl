"use client";

import { useState } from "react";
import Link from "next/link";
import { CompanyAssessmentForm } from "@/components/CompanyAssessmentForm";

export function AssessmentSubmissionFlow({ companyName }: { companyName: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-warm px-4 text-center">
        <p className="font-serif text-2xl text-ink">Assessment submitted</p>
        <p className="max-w-sm text-ink-mid">
          Thanks — {companyName}&apos;s Family Trust Score will update once this has
          been reviewed.
        </p>
        <Link
          href="/employers/dashboard"
          className="mt-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-azure"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <CompanyAssessmentForm
      companyName={companyName}
      onSubmit={(answers) => {
        // Persistence lands in a follow-up task — for now this just advances the UI.
        console.log("assessment submitted", answers);
        setSubmitted(true);
      }}
    />
  );
}
