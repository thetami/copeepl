function ConstructionMark() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="h-full w-full"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="coneClip">
          <path d="M120,58 L152,178 Q152,184 146,184 L94,184 Q88,184 88,178 Z" />
        </clipPath>
        <pattern
          id="hazard"
          width="14"
          height="14"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="14" height="14" fill="#111827" />
          <rect width="7" height="14" fill="#fbbf24" />
        </pattern>
      </defs>

      <rect x="40" y="212" width="160" height="16" rx="4" fill="url(#hazard)" />
      <rect x="72" y="184" width="96" height="18" rx="6" fill="#1c1917" />

      <g
        className="animate-[wobble_4s_ease-in-out_infinite]"
        style={{ transformOrigin: "120px 184px" }}
      >
        <g clipPath="url(#coneClip)">
          <rect x="80" y="50" width="80" height="140" fill="#f59e0b" />
          <rect x="80" y="95" width="80" height="16" fill="#ffffff" />
          <rect x="80" y="130" width="80" height="16" fill="#ffffff" />
          <rect x="80" y="168" width="80" height="16" fill="#d97706" />
        </g>
        <path
          d="M120,58 L152,178 Q152,184 146,184 L94,184 Q88,184 88,178 Z"
          fill="none"
          stroke="#92400e"
          strokeWidth="3"
        />
      </g>

      <circle
        cx="50"
        cy="80"
        r="4"
        fill="#38bdf8"
        className="animate-[pulse-soft_3s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <circle
        cx="192"
        cy="58"
        r="3"
        fill="#7dd3fc"
        className="animate-[pulse-soft_4s_ease-in-out_infinite]"
        style={{
          animationDelay: "1s",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      />
      <circle
        cx="198"
        cy="140"
        r="3"
        fill="#bae6fd"
        className="animate-[pulse-soft_3.5s_ease-in-out_infinite]"
        style={{
          animationDelay: "0.6s",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b2942] px-6 py-24 text-white">
      <div className="relative flex flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Coming soon
        </h1>
        <div className="h-40 w-40 sm:h-48 sm:w-48">
          <ConstructionMark />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            copeepl
          </h1>
          <p className="max-w-md text-balance text-lg leading-relaxed text-slate-300">
            A platform for parents by parents.
          </p>
        </div>
      </div>

      <footer className="relative mt-16 text-sm text-slate-500">
        © {new Date().getFullYear()} Copeepl
      </footer>
    </main>
  );
}
