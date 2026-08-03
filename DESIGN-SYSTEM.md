# Copeepl — Design System Reference

Use this file as the source of truth when building UI components. Reference
it directly in Claude Code prompts, e.g. "Read DESIGN-SYSTEM.md and build
the CompanyCard component."

## Brand Colours (already in tailwind.config.ts)

| Token       | Hex     | Usage                                                                   |
| ----------- | ------- | ----------------------------------------------------------------------- |
| `azure`     | #192a37 | Nav, headers, structural backgrounds                                    |
| `azure-mid` | #243d50 | Secondary dark surfaces                                                 |
| `teal`      | #3fc1a5 | Trust signals, high scores, CTAs, Verified badge                        |
| `teal-pale` | #e6f8f4 | Light backgrounds for positive/verified elements                        |
| `crimson`   | #e84a7e | HEART MOMENTS ONLY — Parent Recommended badge, recommend %, heart icons |
| `low`       | #7a95a6 | Low scores, de-emphasised warnings (NOT crimson — see rule below)       |
| `low-pale`  | #eef3f6 | Light backgrounds for low-score elements                                |
| `warm`      | #f8f5f1 | Page background                                                         |
| `warm-mid`  | #eee9e2 | Borders, dividers, card backgrounds                                     |
| `ink`       | #192a37 | Primary text                                                            |
| `ink-mid`   | #4a6070 | Secondary text                                                          |
| `ink-light` | #7a95a6 | Muted/meta text                                                         |

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

Use the 9 finalised questions below — exact copy and answer options.

**Q1. Are you a current or former employee?**
Options: `Current` / `Former`
_(Context only — not scored)_

**Q2. Which applies to you?**
Options: `Parent` / `Carer` / `Both`
_(Context only — not scored)_

**Q3. How does the company's actual support for parents and carers compare to what you expected when you joined?**
Options: `Much better than I expected` / `About what I expected` / `Worse than I expected` / `Much worse than I expected`
_(Feeds: Policy Score)_

**Q4. When family life clashed with work — a sick child, a school event, a care emergency — your experience was...**
Options: `Always handled with understanding` / `Usually fine` / `Hit and miss` / `Rarely handled well` / `Never handled well`
_(Feeds: Reality Score)_

**Q5. After returning from parental or carer leave, your role and responsibilities were...**
Options: `Fully protected` / `Mostly unchanged` / `Subtly reduced` / `Significantly reduced` / `Didn't take leave`
_(Feeds: Return Score. Skip this question in the UI if the user has never taken leave — branch off Q1/Q2 context if known.)_

**Q6. Do you feel having family or caring commitments affects your chances of progression compared to colleagues without them?**
Options: `Not at all` / `Slightly` / `Noticeably` / `Significantly`
_(Feeds: Reality Score — captures the "always-on" career penalty)_

**Q7. The biggest barrier to being a parent or carer at this company was...**
Options: `Manager attitudes` / `Unwritten cultural expectations` / `Workload and hours` / `Lack of flexible options` / `No significant barriers`
*(Feeds: Reality Score — diagnostic, explains *why* a score is low)*

**Q8. Would you recommend this company to a close friend who is about to become a parent or has caring responsibilities?**
Options: `Absolutely yes` / `Probably yes` / `Probably not` / `Definitely not`
_(This is the headline stat — displayed as the "% would recommend" crimson heart stat everywhere in the UI)_

**Q9. "If a friend asked you 'what's it really like there as a parent?' — what would you tell them?"**
Free text, optional, max 280 characters, placeholder should invite honest answers — not just complaints
_(Displayed prominently on the company profile as a human-voice quote)_

### Form UX rules

- One question per screen, progress bar at top (see form-progress pattern)
- Under 2 minutes total completion time — this is a hard constraint
- Mobile-first — most submissions happen on a phone
- Structured options only for Q1–Q8 (tap to select, no free typing) — harder to game, faster to complete
- Q9 is the only free-text field, and it's optional

### 7. `<EmployerDashboard />`

Azure header bar with company name + Verified badge. Metrics row: 4 stat
cards (Family Trust Score in teal, total reviews in ink, would-recommend %
in crimson — the one heart stat — profile views in ink). Two-column
layout below: score breakdown (same pillar bars as profile page) +
pending reviews moderation queue (each pending review in a warm-bg card
with italic quote + Approve/Flag actions).

### 8. `<CompanyAssessmentForm />`

Completed by employers when signing up as a Verified Employer. Feeds the
Policy Score. Same single-question-per-screen pattern as the review form,
but longer — group into the four sections below with a section header
between groups.

**Section: Parental Leave**

Q1. What is your enhanced maternity pay?
Options: `Statutory only` / `Up to 4 weeks full pay` / `Up to 12 weeks full pay` / `Up to 26 weeks full pay` / `Full pay for full leave`

Q2. What is your enhanced paternity or partner leave?
Options: `Statutory only` / `2 weeks full pay` / `4 weeks full pay` / `More than 4 weeks full pay`

Q3. Do you offer shared parental leave enhancement?
Options: `Yes — same as maternity` / `Yes — partial` / `Statutory only`

**Section: Flexible Working**

Q4. When can employees request flexible working?
Options: `From day one` / `After probation` / `After 6 months` / `After 1 year`

Q5. What flexible arrangements do you actively support?
Multi-select: `Part time` / `Compressed hours` / `Job share` / `Remote` / `Hybrid` / `Flexible start and finish` / `Term-time only`

Q6. About your flexible workers — please share what you know:
Three sub-parts in one question card:

- % of workforce: `Under 10%` / `10–25%` / `25–50%` / `Over 50%` / `We don't track this`
- Seniority levels: `Junior only` / `Up to middle management` / `Up to senior management` / `All levels including leadership`
- Gender split: `Predominantly women 75%+` / `Majority women` / `Roughly equal` / `Majority men` / `We don't track this`

**Section: Culture and Support**

Q7. Do you have a formal carer's policy beyond parents?
Options: `Yes — publicly available` / `Yes — internal only` / `No`

Q8. Do you offer emergency dependant leave beyond the legal minimum?
Options: `Yes` / `No` / `We follow statutory minimum`

Q9. In the last 12 months, has anyone in a senior leadership role taken parental leave?
Options: `Yes` / `No` / `Not applicable` / `Prefer not to say`

Q10. Are employees on parental or carer leave included in company-wide pay reviews, bonus cycles and promotion considerations?
Options: `Yes, always` / `Usually` / `No` / `We don't have formal processes for this`

Q11. Do you have a return-to-work programme for people returning from extended leave?
Options: `Yes — formal programme` / `Yes — informal support` / `No`

**Section: Open Question**

Q12. What do you do for parents and carers that you're most proud of — that isn't captured above?
Free text, optional, max 500 characters

### Assessment renewal

This form must be re-completed annually — surface a reminder in the
employer dashboard when a company's assessment is 11+ months old, and
mark the Verified badge as "renewal due" rather than removing it outright.

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
