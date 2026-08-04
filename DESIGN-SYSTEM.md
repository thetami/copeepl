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
(crimson, the one "heart" stat) on the left. Four bars on the right:
Policy, Day-to-day reality, Return from leave, Career progression.
Each bar uses teal fill if score >= 3.5, low grey fill if below.

**Important — scoring vs. display are not 1:1.** Only THREE pillars are
weighted in the Family Trust Score calculation: Policy (25%), Reality
(45%), Return (30%). "Career progression" is NOT a fourth weighted
pillar — it's Q6's average score surfaced as its own UI stat, pulled
directly from the Reality pillar's underlying data, for transparency.
Q6 still counts toward the Reality pillar average in the score calc.
Do not add a fourth weight or you'll double-count Q6 and the maths
won't reconcile against the documented 25/45/30 split.

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
_(Feeds: Reality Score — measures lived experience against expectation, NOT company policy. Policy comes only from the Company Assessment, never the review form.)_

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
_(Categorical/diagnostic only — NEVER averaged into any pillar score. Stored as biggest_barrier_enum, used solely for a "most reported barriers" breakdown chart on the company profile/dashboard.)_

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

## Score Calculation Formula

**Storage model:** reviews store PRE-AGGREGATED per-review scores
(computed by the review submission server action at write time), NOT
raw per-question answers. This keeps the schema clean and avoids
recomputing point-mappings on every read.

### `reviews` table — scored columns

| Column                 | Type                   | Computed from                                                                    |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `reality_score`        | smallint 1-5           | avg(Q3_score, Q4_score, Q6_score)                                                |
| `return_score`         | smallint 1-5, nullable | Q5_score; NULL if "Didn't take leave"                                            |
| `progression_score`    | smallint 1-5, nullable | Q6_score alone — isolated for the UI display stat, NOT re-averaged into anything |
| `biggest_barrier_enum` | enum                   | Q7 raw value — categorical, never scored/averaged                                |

There is no `policy_score` on `reviews` — Policy comes only from
`company_assessment`.

### Review question → point mapping (computed at submission time)

| Q                                                                         | Options → Score                                                                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q3 expectation gap                                                        | Much worse=1 · Worse=2.33 · About expected=3.67 · Much better=5                                                                                   |
| Q4 emergency handling                                                     | Never=1 · Rarely=2 · Hit and miss=3 · Usually=4 · Always=5                                                                                        |
| Q5 return protection                                                      | Sig. reduced=1 · Subtly reduced=2.33 · Mostly unchanged=3.67 · Fully protected=5 · Didn't take leave=NULL (excluded from denominator, not zeroed) |
| Q6 progression penalty (reverse-scored — "not at all" is the good answer) | Significantly=1 · Noticeably=2.33 · Slightly=3.67 · Not at all=5                                                                                  |

### Company assessment question → point mapping (`policy_pillar` input)

Average of Q1–Q11 (Q12 is free text, unscored). Q6 is itself an average
of its three sub-parts before folding into the Q1-11 average.

| Q                         | Options → Score                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Q1 maternity pay          | Statutory=1 · 4wk full=2 · 12wk full=3 · 26wk full=4 · Full pay=5                                 |
| Q2 paternity/partner      | Statutory=1 · 2wk=2.33 · 4wk=3.67 · More than 4wk=5                                               |
| Q3 shared parental        | Statutory=1 · Partial=3 · Same as maternity=5                                                     |
| Q4 flexible from          | After 1yr=1 · After 6mo=2.33 · After probation=3.67 · Day one=5                                   |
| Q5 arrangements supported | (count selected / 7) × 4 + 1                                                                      |
| Q6a workforce %           | <10%=1 · 10-25%=2.33 · 25-50%=3.67 · >50%=5 · Don't track=1                                       |
| Q6b seniority spread      | Junior only=1 · Mid mgmt=2.33 · Senior mgmt=3.67 · All incl. leadership=5                         |
| Q6c gender split          | Predominantly women=1 · Majority women=2.33 · Roughly equal=5 · Majority men=3.67 · Don't track=1 |
| Q7 carer's policy         | No=1 · Internal only=3 · Publicly available=5                                                     |
| Q8 emergency leave        | No=1 · Statutory min=3 · Yes=5                                                                    |
| Q9 leader took leave      | No=1 · Prefer not to say=2 · N/A=2.5 · Yes=5                                                      |
| Q10 pay/promo inclusion   | No formal process=1 · No=1 · Usually=3.67 · Always=5                                              |
| Q11 return programme      | No=1 · Informal=3 · Formal=5                                                                      |

_These are v1 heuristic weights — reasonable defaults, not final. Revisit once real review data shows which questions actually discriminate between good and bad employers._

### Aggregation (company-level, computed by `calculate_company_score()`)

```
policy_pillar  = point-mapped average of latest company_assessment row  // 1-5
reality_pillar = avg(reviews.reality_score) across published reviews    // 1-5
return_pillar  = avg(reviews.return_score) across published reviews
                 where NOT NULL                                          // 1-5

family_trust_score = (policy_pillar * 0.25)
                    + (reality_pillar * 0.45)
                    + (return_pillar * 0.30)

career_progression_stat = avg(reviews.progression_score)
                           across published reviews
would_recommend_percentage = % of Q8 answers = 'absolutely_yes'
                              OR 'probably_yes'
```

- Minimum 5 published reviews required before `family_trust_score` is
  shown publicly
- `return_pillar` excludes NULL return_score rows from the denominator
  entirely — never treated as 0
- `career_progression_stat` is a read-only projection of
  `reviews.progression_score` for UI display only (the bar in
  `TrustScoreBreakdown`) — it is NOT a 4th weighted pillar and is never
  fed back into `family_trust_score`
- `biggest_barrier_enum` (Q7) is never averaged into anything — query
  it separately as a grouped count for a "most reported barriers" chart
- Recalculate on every review published + every new company_assessment
  saved (trigger-based, real-time, not batched)

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
