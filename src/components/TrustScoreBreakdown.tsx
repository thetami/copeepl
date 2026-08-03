import { TrustScoreRing } from "@/components/TrustScoreRing";
import { PillarBars, type PillarScores } from "@/components/PillarBars";

interface TrustScoreBreakdownProps {
  score: number; // 0-5, overall Family Trust Score
  reviewCount: number;
  recommendPercent: number; // 0-100
  pillars: PillarScores;
}

export function TrustScoreBreakdown({
  score,
  reviewCount,
  recommendPercent,
  pillars,
}: TrustScoreBreakdownProps) {
  return (
    <div className="flex flex-wrap gap-6 bg-warm p-8">
      <div className="flex-[0_0_200px] rounded-2xl border border-warm-mid bg-white p-6 text-center">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-light">
          Family Trust Score
        </div>
        <div className="mb-4 flex justify-center">
          <TrustScoreRing score={score} size="large" reviewCount={reviewCount} />
        </div>
        <div className="mt-1 text-[12px] text-ink-light">
          Based on {reviewCount.toLocaleString()} verified reviews
        </div>
        <div className="mt-4 border-t border-warm-mid pt-4 text-[22px] font-semibold text-crimson">
          {recommendPercent}%
          <div className="text-[11px] font-normal text-ink-light">
            ♥ would recommend to a parent
          </div>
        </div>
      </div>

      <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
        <div className="mb-1 text-[13px] font-medium text-ink-light">Score breakdown</div>
        <PillarBars pillars={pillars} />
      </div>
    </div>
  );
}
