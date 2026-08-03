interface TrustScoreRingProps {
  score: number; // 0-5
  size?: "mini" | "large";
  reviewCount?: number;
}

const RING_CONFIG = {
  mini: { dimension: 44, radius: 18, strokeWidth: 4, textY: 27, fontSize: "text-xs" },
  large: { dimension: 100, radius: 40, strokeWidth: 8, textY: 44, fontSize: "text-[26px]" },
} as const;

export function TrustScoreRing({ score, size = "large", reviewCount }: TrustScoreRingProps) {
  const { dimension, radius, strokeWidth, textY, fontSize } = RING_CONFIG[size];
  const center = dimension / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 5) * circumference;
  const isLow = score < 4;

  const label = `Family Trust Score: ${score.toFixed(1)} out of 5${
    reviewCount !== undefined ? ` based on ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : ""
  }`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      role="img"
      aria-label={label}
    >
      <circle
        className="stroke-warm-mid"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
      />
      <circle
        className={isLow ? "stroke-low" : "stroke-teal"}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference - progress}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={textY}
        textAnchor="middle"
        className={`font-serif ${fontSize} ${isLow ? "fill-low" : "fill-ink"}`}
      >
        {score.toFixed(1)}
      </text>
      {size === "large" && (
        <text x={center} y={60} textAnchor="middle" className="font-sans text-[11px] fill-ink-light">
          out of 5
        </text>
      )}
    </svg>
  );
}
