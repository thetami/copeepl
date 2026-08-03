"use client";

import Link from "next/link";
import type { PillarScores } from "@/components/PillarBars";

interface PendingReview {
  id: string;
  quote: string;
}

interface EmployerDashboardProps {
  companyName: string;
  verified: boolean;
  renewalDue?: boolean;
  renewalHref?: string;
  metrics: {
    trustScore: number; // 0-5
    totalReviews: number;
    recommendPercent: number; // 0-100
    profileViews: number;
  };
  pillars: PillarScores;
  pendingReviews: PendingReview[];
  onApprove?: (id: string) => void;
  onFlag?: (id: string) => void;
}

const PILLAR_LABELS: { key: keyof PillarScores; label: string }[] = [
  { key: "policy", label: "Policy" },
  { key: "dayToDayReality", label: "Day-to-day reality" },
  { key: "returnFromLeave", label: "Return from leave" },
  { key: "careerProgression", label: "Career progression" },
];

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[10px] border border-warm-mid bg-white p-3.5 text-center">
      <p className={`mb-1 text-2xl leading-none font-semibold ${valueClassName}`}>{value}</p>
      <p className="text-[11px] text-ink-light">{label}</p>
    </div>
  );
}

export function EmployerDashboard({
  companyName,
  verified,
  renewalDue = false,
  renewalHref,
  metrics,
  pillars,
  pendingReviews,
  onApprove,
  onFlag,
}: EmployerDashboardProps) {
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between bg-azure px-6 py-5">
        <div>
          <div className="text-[15px] font-medium text-white">
            {companyName} — Employer dashboard
          </div>
          <div className="text-xs text-white/50">
            {verified ? "Verified Employer · Subscription active" : "Not yet verified"}
          </div>
        </div>
        {verified && (
          <span className="rounded-full bg-teal px-3 py-1 text-[11px] font-semibold text-azure">
            ✓ Verified
          </span>
        )}
      </header>

      <div className="bg-warm px-6 py-5">
        {renewalDue && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-warm-mid bg-low-pale p-4 text-sm text-low">
            <span>
              Your Family Trust Score assessment is over 11 months old. Renew
              it to keep your Verified badge fully up to date.
            </span>
            {renewalHref && (
              <Link href={renewalHref} className="font-semibold underline">
                Renew now
              </Link>
            )}
          </div>
        )}

        <div className="mb-5 grid grid-cols-4 gap-2.5">
          <StatCard
            label="Family Trust Score"
            value={metrics.trustScore.toFixed(1)}
            valueClassName="text-teal"
          />
          <StatCard
            label="Total reviews"
            value={metrics.totalReviews.toLocaleString()}
            valueClassName="text-ink"
          />
          <StatCard
            label="♥ Would recommend"
            value={`${metrics.recommendPercent}%`}
            valueClassName="text-crimson"
          />
          <StatCard
            label="Profile views this month"
            value={metrics.profileViews.toLocaleString()}
            valueClassName="text-ink"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] border border-warm-mid bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-light">
              Score breakdown
            </div>
            {PILLAR_LABELS.map(({ key, label }, i) => {
              const score = pillars[key];
              const isLow = score < 4;
              return (
                <div
                  key={key}
                  className={`py-2.5 ${
                    i < PILLAR_LABELS.length - 1 ? "border-b border-warm-mid" : ""
                  }`}
                >
                  <div className="mb-1 text-xs text-ink-light">{label}</div>
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isLow ? "text-low" : "text-ink"
                    }`}
                  >
                    {score.toFixed(1)}
                    <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-warm-mid">
                      <div
                        className={`h-full rounded-[3px] ${isLow ? "bg-low" : "bg-teal"}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[10px] border border-warm-mid bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-light">
              Reviews awaiting moderation
            </div>
            {pendingReviews.length === 0 ? (
              <p className="text-sm text-ink-light">No reviews awaiting moderation.</p>
            ) : (
              pendingReviews.map((review) => (
                <div key={review.id} className="mb-2 rounded-lg bg-warm px-3 py-2.5">
                  <p className="mb-1.5 text-[13px] italic text-ink">&ldquo;{review.quote}&rdquo;</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove?.(review.id)}
                      className="text-[11px] font-medium text-teal-dark"
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onFlag?.(review.id)}
                      className="text-[11px] font-medium text-low"
                    >
                      ⚑ Flag for review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
