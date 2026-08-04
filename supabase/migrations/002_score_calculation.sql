-- Copeepl Family Trust Score calculation
--
-- Assumptions made where the spec left a detail open (flag to reconsider):
--   * company_scores.policy_score (existing column from 001) is repurposed
--     to store the raw policy_pillar value -- needed for the Policy bar in
--     <TrustScoreBreakdown/>, distinct from family_trust_score (the
--     weighted composite). Same treatment for reality_score/return_score:
--     they now hold reality_pillar/return_pillar rather than an average of
--     reviews.overall_score as the old recalculate_company_scores() did.
--   * `latest company_assessment row` = the single row for that company_id
--     (the table already enforces one row per company via a unique
--     constraint on company_id) -- there is no assessment history, so
--     "latest" is just whatever row exists.
--   * policy_pillar (and therefore family_trust_score) is only computed
--     from a company_assessment row where completed_at is not null -- an
--     in-progress draft assessment doesn't count. If a company has 5+
--     published reviews but no completed assessment yet, company_scores
--     is still upserted with reality/return/career_progression_stat/
--     would_recommend_percentage, but family_trust_score stays NULL until
--     an assessment is completed (both pillars are required inputs).
--   * Unanswered assessment questions (nullable columns) are excluded from
--     the policy_pillar average entirely, not scored as 0/1 or defaulted.
--   * Several DESIGN-SYSTEM.md point-mapping tiers don't line up 1:1 with
--     the enums actually defined in 001_initial_schema.sql. Best-effort
--     ordinal mappings below, flagged per field:
--       - shared_parental_leave_enum has 3 values (not_offered/
--         statutory_only/enhanced) vs. the doc's 3 labelled tiers (same as
--         maternity/partial/statutory) -- no distinct "partial" value
--         exists, so both not_offered and statutory_only map to 1 and
--         enhanced maps to 5.
--       - flexible_working_from_enum has an extra 'not_available' value
--         with no doc equivalent -- mapped to the same floor (1) as
--         'after_12_months'.
--       - flexible_workforce_percentage_enum has 6 values incl. 'none'
--         and splits >50% into two tiers, and has no 'don't track' value
--         -- 'none' and 'up_to_10_percent' both map to 1, both >50% tiers
--         map to 5.
--       - flexible_seniority_levels_enum has 3 values vs. the doc's 4
--         tiers -- evenly spaced 1 / 3 / 5.
--       - flexible_gender_split_enum collapses the doc's 5 tiers into 4
--         buckets -- mostly_women=1, balanced=5, mostly_men=3.67,
--         not_tracked=1, matching the doc's low/high pattern as closely
--         as the enum allows.
--       - formal_carers_policy_enum (yes/no/in_development) doesn't
--         distinguish "internal only" from "publicly available" -- yes=5,
--         in_development=3, no=1.
--       - senior_leader_parental_leave_enum asks a different question
--         (same policy vs. different policy) than the doc's Q9 (has
--         anyone senior taken leave, yes/no/na/prefer not to say) --
--         mapped same_as_all_staff=5, different_policy=2.5,
--         not_tracked=2, none_taken_yet=1.
--       - pay_review_inclusion_enum's 'not_applicable' has no clean doc
--         equivalent -- mapped alongside 'excluded' at 1.
--     These are all v1 heuristics per DESIGN-SYSTEM.md's own note ("not
--     final, revisit once real review data shows which questions actually
--     discriminate") -- reconsider once the assessment form copy and its
--     enums are reconciled.

-- ============================================================================
-- 1. reviews: policy_score is dropped (policy is assessment-only), add
--    progression_score (Q6 isolated for the career_progression_stat
--    display stat, independent of reality_score).
-- ============================================================================

alter table public.reviews drop column if exists policy_score;

alter table public.reviews
  add column progression_score smallint
    check (progression_score is null or progression_score between 1 and 5);

comment on column public.reviews.progression_score is 'Q6 score, isolated from reality_score, for the career_progression_stat UI projection. Computed by the review submission server action at write time -- never re-averaged into reality_score or any other pillar.';

-- ============================================================================
-- 2. Drop the old unweighted recalculation system.
--    recalculate_company_scores() only averaged reviews.overall_score (a
--    self-reported figure) -- superseded entirely by calculate_company_score().
-- ============================================================================

drop trigger if exists reviews_recalculate_company_scores on public.reviews;
drop function if exists public.trigger_recalculate_company_scores();
drop function if exists public.recalculate_company_scores(uuid);

alter table public.company_scores drop column if exists overall_score;

-- ============================================================================
-- 3. company_scores: add family_trust_score + career_progression_stat.
-- ============================================================================

alter table public.company_scores
  add column if not exists family_trust_score numeric(3, 2)
    check (family_trust_score is null or family_trust_score between 1 and 5);

alter table public.company_scores
  add column if not exists career_progression_stat numeric(3, 2)
    check (career_progression_stat is null or career_progression_stat between 1 and 5);

comment on column public.company_scores.family_trust_score is 'Weighted composite: policy_pillar*0.25 + reality_pillar*0.45 + return_pillar*0.30. NULL until >=5 published reviews AND a completed company_assessment exist.';
comment on column public.company_scores.career_progression_stat is 'Display-only avg(reviews.progression_score) across published reviews -- never fed back into family_trust_score.';

-- ============================================================================
-- 4. calculate_company_score(company_id uuid)
-- ============================================================================

create function public.calculate_company_score(company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p_company_id alias for company_id;

  v_total_reviews integer;
  v_reality_pillar numeric;
  v_return_pillar numeric;
  v_career_progression_stat numeric;
  v_would_recommend_percentage numeric(5, 2);

  ca public.company_assessment%rowtype;
  v_q1 numeric;
  v_q2 numeric;
  v_q3 numeric;
  v_q4 numeric;
  v_q5 numeric;
  v_q6a numeric;
  v_q6b numeric;
  v_q6c numeric;
  v_q6 numeric;
  v_q7 numeric;
  v_q8 numeric;
  v_q9 numeric;
  v_q10 numeric;
  v_q11 numeric;
  v_policy_pillar numeric;
  v_family_trust_score numeric(3, 2);
begin
  select
    count(*),
    avg(r.reality_score),
    avg(r.return_score),
    avg(r.progression_score),
    (count(*) filter (where r.would_recommend in ('absolutely_yes', 'probably_yes'))::numeric
      / nullif(count(*), 0)) * 100
  into
    v_total_reviews,
    v_reality_pillar,
    v_return_pillar,
    v_career_progression_stat,
    v_would_recommend_percentage
  from public.reviews r
  where r.company_id = p_company_id
    and r.is_published = true;

  if coalesce(v_total_reviews, 0) < 5 then
    return;
  end if;

  select * into ca
  from public.company_assessment
  where public.company_assessment.company_id = p_company_id;

  if found and ca.completed_at is not null then
    v_q1 := case ca.maternity_pay
      when 'statutory_only' then 1
      when 'enhanced_up_to_3_months' then 2
      when 'enhanced_up_to_6_months' then 3
      when 'enhanced_up_to_12_months' then 4
      when 'full_pay_12_months' then 5
    end;

    v_q2 := case ca.paternity_leave
      when 'statutory_only' then 1
      when 'one_to_two_weeks_full_pay' then 2.33
      when 'two_to_four_weeks_full_pay' then 3.67
      when 'four_plus_weeks_full_pay' then 5
    end;

    v_q3 := case ca.shared_parental_leave
      when 'not_offered' then 1
      when 'statutory_only' then 1
      when 'enhanced' then 5
    end;

    v_q4 := case ca.flexible_working_from
      when 'day_one' then 5
      when 'after_probation' then 3.67
      when 'after_6_months' then 2.33
      when 'after_12_months' then 1
      when 'not_available' then 1
    end;

    v_q5 := case when ca.flexible_arrangements is null then null
      else (coalesce(array_length(ca.flexible_arrangements, 1), 0)::numeric / 7) * 4 + 1
    end;

    v_q6a := case ca.flexible_workforce_percentage
      when 'none' then 1
      when 'up_to_10_percent' then 1
      when '11_to_25_percent' then 2.33
      when '26_to_50_percent' then 3.67
      when '51_to_75_percent' then 5
      when '76_to_100_percent' then 5
    end;

    v_q6b := case ca.flexible_seniority_levels
      when 'entry_level_only' then 1
      when 'entry_and_mid_level' then 3
      when 'all_levels_including_senior' then 5
    end;

    v_q6c := case ca.flexible_gender_split
      when 'mostly_women' then 1
      when 'balanced' then 5
      when 'mostly_men' then 3.67
      when 'not_tracked' then 1
    end;

    select avg(v) into v_q6 from unnest(array[v_q6a, v_q6b, v_q6c]) as v;

    v_q7 := case ca.formal_carers_policy
      when 'no' then 1
      when 'in_development' then 3
      when 'yes' then 5
    end;

    v_q8 := case ca.emergency_dependant_leave
      when 'none' then 1
      when 'unpaid_only' then 2.33
      when 'paid_one_to_three_days' then 3.67
      when 'paid_four_plus_days' then 5
    end;

    v_q9 := case ca.senior_leader_parental_leave
      when 'none_taken_yet' then 1
      when 'not_tracked' then 2
      when 'different_policy' then 2.5
      when 'same_as_all_staff' then 5
    end;

    v_q10 := case ca.pay_review_inclusion
      when 'excluded' then 1
      when 'not_applicable' then 1
      when 'sometimes_included' then 3.67
      when 'always_included' then 5
    end;

    v_q11 := case ca.return_to_work_programme
      when 'no' then 1
      when 'yes_informal' then 3
      when 'yes_formal' then 5
    end;

    select avg(v) into v_policy_pillar
    from unnest(array[
      v_q1, v_q2, v_q3, v_q4, v_q5, v_q6, v_q7, v_q8, v_q9, v_q10, v_q11
    ]) as v;
  end if;

  if v_policy_pillar is not null then
    v_family_trust_score := round(
      (v_policy_pillar * 0.25) + (v_reality_pillar * 0.45) + (v_return_pillar * 0.30),
      2
    );
  else
    v_family_trust_score := null;
  end if;

  insert into public.company_scores (
    company_id, policy_score, reality_score, return_score, family_trust_score,
    career_progression_stat, total_reviews, would_recommend_percentage,
    last_calculated_at
  )
  values (
    p_company_id, round(v_policy_pillar, 2), round(v_reality_pillar, 2),
    round(v_return_pillar, 2), v_family_trust_score, round(v_career_progression_stat, 2),
    v_total_reviews, v_would_recommend_percentage, now()
  )
  on conflict (company_id) do update set
    policy_score = excluded.policy_score,
    reality_score = excluded.reality_score,
    return_score = excluded.return_score,
    family_trust_score = excluded.family_trust_score,
    career_progression_stat = excluded.career_progression_stat,
    total_reviews = excluded.total_reviews,
    would_recommend_percentage = excluded.would_recommend_percentage,
    last_calculated_at = excluded.last_calculated_at;
end;
$$;

comment on function public.calculate_company_score(uuid) is 'Recomputes company_scores for one company. No-op (does not upsert) until >=5 published reviews exist. family_trust_score stays NULL until a completed company_assessment also exists.';

-- ============================================================================
-- 5. Triggers
-- ============================================================================

create function public.trigger_calculate_company_score_from_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculate_company_score(new.company_id);
  return new;
end;
$$;

create trigger reviews_calculate_company_score
  after update on public.reviews
  for each row
  when (new.is_published = true and old.is_published is distinct from new.is_published)
  execute function public.trigger_calculate_company_score_from_review();

create function public.trigger_calculate_company_score_from_assessment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.calculate_company_score(new.company_id);
  return new;
end;
$$;

create trigger company_assessment_calculate_company_score
  after insert or update on public.company_assessment
  for each row
  when (new.completed_at is not null)
  execute function public.trigger_calculate_company_score_from_assessment();
