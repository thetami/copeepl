## Project: Copeepl

Family-trust platform helping parents and carers find companies
that genuinely support family life.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Supabase (auth, database, storage)
- Tailwind CSS
- Vercel (deployment)
- Stripe (payments)

## Current Status

Next.js + Supabase + Vercel all live with custom domain. Database
schema built across two migrations:

- `001_initial_schema.sql` — companies, reviews, company_scores,
  employer_accounts, company_assessment, profiles. All tables have
  RLS enabled.
- `002_score_calculation.sql` — Family Trust Score calculation.
  Written and reviewed by hand (enum coverage, null-propagation,
  the company_id parameter/column ambiguity fix) but **NOT YET
  EXECUTED OR TESTED** against a real Postgres instance. Do not
  assume this migration works — it has never been run.

DESIGN-SYSTEM.md is the single source of truth for the scoring
methodology (point-mapping tables, aggregation formula, weighting).
It has no external dependencies — do not reference an "Idea
Validation doc," it was chat-only and never existed in this repo.

## KNOWN ISSUE — must fix before anything else touches company_scores

`002_score_calculation.sql` currently REPURPOSES existing columns
`company_scores.policy_score`, `reality_score`, `return_score` to
hold the new weighted pillar values, instead of renaming them. This
is a deliberate decision to avoid, not a decision already accepted —
reusing a column for a different semantic meaning than its name
implies is a real bug magnet (anyone reading `policy_score` later
will reasonably assume the old, different meaning).

**Do this first, before running or testing the migration:**

Amend `002_score_calculation.sql` (or add a `003_rename_pillars.sql`
if 002 has already been applied anywhere) to properly rename:

- `company_scores.policy_score` → `policy_pillar`
- `company_scores.reality_score` → `reality_pillar`
- `company_scores.return_score` → `return_pillar`

Update `calculate_company_score()` to write to the renamed columns.
Update any src/ code that reads `company_scores.*` to match (search
the repo first — confirm nothing currently depends on the old names
before renaming, then update call sites).

This must be resolved BEFORE the migration is trusted or run for
the first time. Do not defer this — treat it as part of the same
unit of work as the score calculation itself, not a follow-up.

## Next Task (in order)

1. Fix the column naming issue above (policy_pillar / reality_pillar
   / return_pillar) — this is blocking, do it first.
2. Run the migration for the first time:
   ```
   supabase start
   supabase db reset
   ```
3. Seed test fixtures and verify against hand-calculated expected
   values (using the point-mapping tables in DESIGN-SYSTEM.md) for
   these specific edge cases:
   - Exactly 4 published reviews → family_trust_score should NOT
     populate (threshold is 5, not 4)
   - The 5th review published → trigger fires → company_scores row
     now exists with correct values
   - A review with return_score/return_pillar = NULL ("didn't take
     leave") → confirmed EXCLUDED from return_pillar's denominator,
     never averaged in as 0
   - A company_assessment with a "prefer not to say" / "don't track
     this" answer on Q9/Q6a/Q6c → maps to the documented low-but-not-
     punitive score, not NULL/error
   - A 6th review published → trigger recalculates (upsert via
     ON CONFLICT DO UPDATE), not a duplicate row
   - Running calculate_company_score() twice manually in a row →
     idempotent, same output both times
4. Cross-check the enum mapping CASE statements (specifically
   shared_parental_leave_enum, flexible_seniority_levels_enum,
   senior_leader_parental_leave_enum — flagged as best-effort in the
   002 migration's header comment) against DESIGN-SYSTEM.md's
   scoring guide tables. Confirm every enum value has an explicit,
   correct mapping — no silent fallthrough to a default score.
5. Only after 1–4 are confirmed working: build TrustScoreRing
   (presentational, no data dependency) and CompanyCard (reads from
   the now-trustworthy company_scores table).

## Notes

- v1 scoring weights (25/45/30 split, point-mapping tables) are
  documented heuristic defaults — flagged for revisit once real
  review data exists, not something to over-index on now.
- Nothing in src/ should read company_scores.policy_score /
  reality_score / return_score by their OLD meaning — verify this
  during the rename in step 1.
