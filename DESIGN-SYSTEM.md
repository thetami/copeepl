# Copeepl — Design System Reference

Use this file as the source of truth when building UI components. Reference
it directly in Claude Code prompts, e.g. "Read DESIGN-SYSTEM.md and build
the CompanyCard component."

## Brand Colours (already in tailwind.config.ts)

| Token | Hex | Usage |
|---|---|---|
| `azure` | #192a37 | Nav, headers, structural backgrounds |
| `azure-mid` | #243d50 | Secondary dark surfaces |
| `teal` | #3fc1a5 | Trust signals, high scores, CTAs, Verified badge |
| `teal-pale` | #e6f8f4 | Light backgrounds for positive/verified elements |
| `crimson` | #e84a7e | HEART MOMENTS ONLY — Parent Recommended badge, recommend %, heart icons |
| `low` | #7a95a6 | Low scores, de-emphasised warnings (NOT crimson — see rule below) |
| `low-pale` | #eef3f6 | Light backgrounds for low-score elements |
| `warm` | #f8f5f1 | Page background |
| `warm-mid` | #eee9e2 | Borders, dividers, card backgrounds |
| `ink` | #192a37 | Primary text |
| `ink-mid` | #4a6070 | Secondary text |
| `ink-light` | #7a95a6 | Muted/meta text |

### Critical colour rule
Crimson is reserved ONLY for warm, human, emotional moments:
- Parent Recommended badge
- "Would recommend" percentage stat
- Heart icons

Crimson must NEVER be used for low scores or warnings — that creates a
confusing double-meaning (warm feeling vs. danger signal). Low scores use
the muted `low` grey instead, which reads as "room to improve" rather than
"alarm."

## Typography

- Display/headings: DM Serif Display (`font-serif`) — used sparingly for
  page titles, hero headlines, company names, big score numbers
- Body/UI: Inter (`font-sans`) — everything else

## Signature Element: The Family Trust Score Ring

The core visual identity of the platform. NOT star ratings, NOT a plain
progress bar — a circular arc gauge (SVG), teal stroke on a warm-mid
track, with the score number in the centre in DM Serif Display.

```tsx
// components/TrustScoreRing.tsx
interface TrustScoreRingProps {
  score: number; // 0-5
  size?: number; // px, default 100 for large, 44 for mini
  reviewCount?: number;
}

// Circle math: circumference = 2 * PI * r
// r=40 (large, size=100) -> circumference ≈ 251
// r=18 (mini, size=44) -> circumference ≈ 113
// dasharray = (score / 5) * circumference
// stroke color: teal (#3fc1a5) if score >= 4, low (#7a95a6) if score < 3.5
```

## Components to Build (in order of priority)

### 1. `<TrustScoreRing />`
Circular SVG gauge. Two sizes: `mini` (44px, used in company cards) and
`large` (100px, used on company profile page). Colour switches teal/grey
based on score threshold (see rule above).

### 2. `<CompanyCard />`
Used on landing/search pages. Contains:
- Logo (rounded-lg, azure bg, initials in serif white text)
- Verified badge (teal-pale bg, teal-dark text, pill shape) OR
  Unverified badge (low-pale bg, low text)
- Company name (font-sans font-semibold)
- Meta line (industry · employee count, ink-light)
- TrustScoreRing (mini) + "Family Trust Score" label + review count
- Recommend row: teal-pale bg if >=75%, low-pale bg if below

### 3. `<CompanyProfileHeader />`
Full-width azure background. Logo (64px, white bg, azure serif initials),
company name (font-serif, 28px, white), meta line, badge row
(Verified Employer in solid teal pill + Parent Recommended in crimson-tint
pill with heart icon), tab navigation (Overview / Reviews / Jobs /
Assessment) with teal underline on active tab.

### 4. `<TrustScoreBreakdown />`
Large TrustScoreRing + total review count + recommend percentage
(crimson, the one "heart" stat) on the left. Four pillar bars on the
right: Policy, Day-to-day reality, Return from leave, Career progression.
Each pillar bar uses teal fill if score >= 3.5, low grey fill if below.

### 5. `<ReviewCard />`
Reviewer avatar (initials, circle, teal-pale bg) + name + employee
status/reviewer type meta + LinkedIn verified badge (teal-pale, top
right). Italic quote text (ink-mid). Bottom row: heart icon + recommend
sentiment — crimson text if positive ("would recommend"), ink-light/grey
if neutral or negative. NEVER crimson for negative sentiment.

### 6. `<ReviewForm />`
Single-question-per-screen flow. Azure header with company name being
reviewed, progress bar (teal fill on rgba white track). Body: question
number label (teal, uppercase, small), question text (16px medium),
stacked option buttons (warm-mid border default, teal border + teal-pale
bg + teal-dark text when selected). Bottom nav: text "Back" link (left),
solid teal pill "Continue" button (right).

Reference the 9 finalised questions from the Idea Validation document
(Section 3b) for exact copy and answer options.

### 7. `<EmployerDashboard />`
Azure header bar with company name + Verified badge. Metrics row: 4 stat
cards (Family Trust Score in teal, total reviews in ink, would-recommend %
in crimson — the one heart stat — profile views in ink). Two-column
layout below: score breakdown (same pillar bars as profile page) +
pending reviews moderation queue (each pending review in a warm-bg card
with italic quote + Approve/Flag actions).

## Layout & Spacing Conventions

- Page background: `bg-warm`
- Card background: `bg-white` with `border border-warm-mid rounded-card`
- Card padding: `p-5` (20px) standard, `p-4` (16px) for compact cards
- Section padding: `px-8 py-10` desktop, reduce for mobile
- Badge/pill shape: `rounded-full`, small padding `px-3 py-1`, `text-xs font-semibold`
- Buttons: pill-shaped (`rounded-full`), teal bg + azure text for primary CTA

## Mobile Considerations

The review form especially must be mobile-first — most reviews will be
submitted on a phone during a spare moment. Ensure:
- Touch targets minimum 44px height
- Single column layouts below `md` breakpoint
- Options stack vertically (already the default pattern)

## What NOT to do

- No gradients, drop shadows, or glow effects — flat design throughout
- No star rating icons — always use the TrustScoreRing for scores
- No crimson on anything score-related except the recommend percentage
- Don't mix serif into body/UI text — serif is reserved for headings and
  the score numbers only
