import { TrustScoreRing } from "@/components/TrustScoreRing";
import { getInitials } from "@/lib/initials";

interface CompanyCardProps {
  name: string;
  industry: string;
  employeeCount: string;
  verified: boolean;
  score: number;
  reviewCount: number;
  recommendPercent: number; // 0-100
  logoInitials?: string;
}

export function CompanyCard({
  name,
  industry,
  employeeCount,
  verified,
  score,
  reviewCount,
  recommendPercent,
  logoInitials,
}: CompanyCardProps) {
  const isLow = score < 4;
  const recommends = recommendPercent >= 75;

  return (
    <article className="rounded-card border border-warm-mid bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-azure">
          <span className="font-serif text-sm text-white">
            {logoInitials ?? getInitials(name)}
          </span>
        </div>

        {verified ? (
          <span className="rounded-full bg-teal-pale px-2 py-[3px] text-[10px] font-semibold text-teal-dark">
            ✓ Verified
          </span>
        ) : (
          <span className="rounded-full bg-low-pale px-2 py-[3px] text-[10px] font-medium text-low">
            Unverified
          </span>
        )}
      </div>

      <div className="mb-0.5 text-[15px] font-semibold text-ink">{name}</div>
      <div className="mb-3 text-[12px] text-ink-light">
        {industry} · {employeeCount}
      </div>

      <div className="mb-2.5 flex items-center gap-2">
        <TrustScoreRing score={score} size="mini" reviewCount={reviewCount} />
        <div>
          <div className={`text-[13px] font-semibold ${isLow ? "text-ink-light" : "text-ink"}`}>
            Family Trust Score
          </div>
          <div className="text-[11px] text-ink-light">
            {reviewCount.toLocaleString()} verified reviews
          </div>
        </div>
      </div>

      {recommends ? (
        <div className="rounded-[6px] bg-teal-pale px-2.5 py-1.5 text-[11px] font-medium text-teal-dark">
          ♥ {recommendPercent}% would recommend to a parent
        </div>
      ) : (
        <div className="rounded-[6px] bg-low-pale px-2.5 py-1.5 text-[11px] font-medium text-low">
          {recommendPercent}% would recommend to a parent
        </div>
      )}
    </article>
  );
}
