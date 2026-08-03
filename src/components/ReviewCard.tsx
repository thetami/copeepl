import { getInitials } from "@/lib/initials";

type Sentiment = "positive" | "neutral" | "negative";

interface ReviewCardProps {
  reviewerName: string;
  reviewerType: string; // e.g. "Current Employee · Parent"
  linkedInVerified?: boolean;
  quote: string;
  sentiment: Sentiment;
  recommendText?: string;
  avatarVariant?: "teal" | "low";
}

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; className: string }> = {
  positive: { label: "Would recommend", className: "text-crimson" },
  neutral: { label: "Neutral", className: "text-ink-light" },
  negative: { label: "Would not recommend", className: "text-ink-light" },
};

export function ReviewCard({
  reviewerName,
  reviewerType,
  linkedInVerified,
  quote,
  sentiment,
  recommendText,
  avatarVariant = "teal",
}: ReviewCardProps) {
  const { label, className } = SENTIMENT_CONFIG[sentiment];

  return (
    <article className="mb-2.5 rounded-card border border-warm-mid bg-white p-5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              avatarVariant === "low" ? "bg-low-pale text-low" : "bg-teal-pale text-teal-dark"
            }`}
          >
            {getInitials(reviewerName)}
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">{reviewerName}</p>
            <p className="text-[11px] text-ink-light">{reviewerType}</p>
          </div>
        </div>

        {linkedInVerified && (
          <span className="shrink-0 rounded-full bg-teal-pale px-2 py-0.5 text-[10px] font-medium text-teal-dark">
            ✓ LinkedIn verified
          </span>
        )}
      </div>

      <p className="mb-2.5 text-sm italic leading-[1.6] text-ink-mid">&ldquo;{quote}&rdquo;</p>

      <div className={`flex items-center gap-1.5 text-xs font-medium ${className}`}>
        ♥ {recommendText ?? label}
      </div>
    </article>
  );
}
