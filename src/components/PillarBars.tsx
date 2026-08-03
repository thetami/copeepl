export interface PillarScores {
  policy: number;
  dayToDayReality: number;
  returnFromLeave: number;
  careerProgression: number;
}

const PILLARS = [
  { key: "policy", label: "Policy" },
  { key: "dayToDayReality", label: "Day-to-day reality" },
  { key: "returnFromLeave", label: "Return from leave" },
  { key: "careerProgression", label: "Career progression" },
] as const;

export function PillarBars({ pillars }: { pillars: PillarScores }) {
  return (
    <div className="flex flex-col gap-2.5">
      {PILLARS.map(({ key, label }) => {
        const score = pillars[key];
        const isLow = score < 4;
        return (
          <div
            key={key}
            className="flex items-center gap-3.5 rounded-xl border border-warm-mid bg-white px-4 py-3.5"
          >
            <div className="flex-1">
              <div className="mb-1.5 text-[12px] font-medium text-ink">{label}</div>
              <div className="h-1.5 overflow-hidden rounded-[3px] bg-warm-mid">
                <div
                  className={`h-full rounded-[3px] ${isLow ? "bg-low" : "bg-teal"}`}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
            </div>
            <div
              className={`min-w-[28px] text-right text-base font-semibold ${
                isLow ? "text-low" : "text-ink"
              }`}
            >
              {score.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
