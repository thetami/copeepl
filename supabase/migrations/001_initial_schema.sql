-- Copeepl initial schema
--
-- Assumptions made where the spec left a detail open (flag to reconsider):
--   * companies.employee_count is free-text (e.g. "51-200") rather than an enum/int.
--   * reviews has a UNIQUE(company_id, user_id) constraint: one review per person
--     per employer, edited in place rather than re-submitted. Remove if repeat
--     reviews over time should be allowed.
--   * reviews.user_id / employer_accounts.user_id reference auth.users directly
--     (ON DELETE CASCADE), so deleting an auth user removes their reviews/employer
--     links. company_scores is recalculated accordingly.
--   * companies/employer_accounts rows are seeded and written by the backend
--     (service_role) — there are intentionally no INSERT policies for anon/
--     authenticated on those tables. Employers can UPDATE descriptive fields on
--     their claimed company, but companies.is_verified/is_claimed and every
--     subscription/stripe column on employer_accounts are locked to service_role
--     via trigger, since they represent paid/billing state.
--   * company_assessment is visible to the public once completed_at is set;
--     while in progress it's visible only to the claiming employer.
--   * profiles are private (owner-only) by default, since reviewers may not want
--     their identity linked to reviews of their employer's family policies.
--   * Enum option lists for the company_assessment fields are reasonable
--     placeholders — adjust values (ALTER TYPE ... ADD VALUE / migrate) to match
--     the actual assessment questionnaire copy.

-- ============================================================================
-- Enum types
-- ============================================================================

create type public.reviewer_type_enum as enum ('parent', 'carer', 'both');

create type public.would_recommend_enum as enum (
  'absolutely_yes',
  'probably_yes',
  'probably_not',
  'definitely_not'
);

create type public.biggest_barrier_enum as enum (
  'manager_attitudes',
  'cultural_expectations',
  'workload',
  'lack_of_flexible_options',
  'no_barriers'
);

create type public.subscription_status_enum as enum ('active', 'inactive', 'trialing');

create type public.subscription_tier_enum as enum ('verified', 'featured', 'enterprise');

create type public.maternity_pay_enum as enum (
  'statutory_only',
  'enhanced_up_to_3_months',
  'enhanced_up_to_6_months',
  'enhanced_up_to_12_months',
  'full_pay_12_months'
);

create type public.paternity_leave_enum as enum (
  'statutory_only',
  'one_to_two_weeks_full_pay',
  'two_to_four_weeks_full_pay',
  'four_plus_weeks_full_pay'
);

create type public.shared_parental_leave_enum as enum ('not_offered', 'statutory_only', 'enhanced');

create type public.flexible_working_from_enum as enum (
  'day_one',
  'after_probation',
  'after_6_months',
  'after_12_months',
  'not_available'
);

create type public.flexible_workforce_percentage_enum as enum (
  'none',
  'up_to_10_percent',
  '11_to_25_percent',
  '26_to_50_percent',
  '51_to_75_percent',
  '76_to_100_percent'
);

create type public.flexible_seniority_levels_enum as enum (
  'entry_level_only',
  'entry_and_mid_level',
  'all_levels_including_senior'
);

create type public.flexible_gender_split_enum as enum ('mostly_women', 'balanced', 'mostly_men', 'not_tracked');

create type public.formal_carers_policy_enum as enum ('yes', 'no', 'in_development');

create type public.emergency_dependant_leave_enum as enum (
  'none',
  'unpaid_only',
  'paid_one_to_three_days',
  'paid_four_plus_days'
);

create type public.senior_leader_parental_leave_enum as enum (
  'same_as_all_staff',
  'different_policy',
  'none_taken_yet',
  'not_tracked'
);

create type public.pay_review_inclusion_enum as enum (
  'always_included',
  'sometimes_included',
  'excluded',
  'not_applicable'
);

create type public.return_to_work_programme_enum as enum ('yes_formal', 'yes_informal', 'no');

-- ============================================================================
-- Tables
-- ============================================================================

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  website text,
  logo_url text,
  employee_count text,
  industry text,
  location text,
  is_verified boolean not null default false,
  is_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.companies is 'Employer directory entries.';
comment on column public.companies.is_verified is 'Paid Verified Employer badge — service_role only.';
comment on column public.companies.is_claimed is 'True once an employer_accounts row links to this company — service_role only.';

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  linkedin_verified boolean not null default false,
  linkedin_profile_url text,
  reviewer_type public.reviewer_type_enum,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public-facing user profile, one row per auth.users row.';

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  is_current_employee boolean not null,
  reviewer_type public.reviewer_type_enum not null,
  policy_score smallint not null check (policy_score between 1 and 5),
  reality_score smallint not null check (reality_score between 1 and 5),
  return_score smallint check (return_score is null or return_score between 1 and 5),
  overall_score smallint not null check (overall_score between 1 and 5),
  would_recommend public.would_recommend_enum not null,
  biggest_barrier public.biggest_barrier_enum not null,
  free_text varchar(280),
  is_verified boolean not null default false,
  is_published boolean not null default false,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reviews_company_id_user_id_key unique (company_id, user_id)
);

comment on table public.reviews is 'Structured employer reviews from parents/carers.';
comment on column public.reviews.is_verified is 'LinkedIn-verified reviewer — service_role only.';
comment on column public.reviews.is_published is 'Passed moderation and visible publicly — service_role only.';
comment on column public.reviews.is_flagged is 'Flagged for moderator review — service_role only.';

create table public.company_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies (id) on delete cascade,
  policy_score numeric(3, 2) check (policy_score is null or policy_score between 1 and 5),
  reality_score numeric(3, 2) check (reality_score is null or reality_score between 1 and 5),
  return_score numeric(3, 2) check (return_score is null or return_score between 1 and 5),
  overall_score numeric(3, 2) check (overall_score is null or overall_score between 1 and 5),
  total_reviews integer not null default 0,
  would_recommend_percentage numeric(5, 2) check (
    would_recommend_percentage is null or would_recommend_percentage between 0 and 100
  ),
  last_calculated_at timestamptz not null default now()
);

comment on table public.company_scores is 'Aggregate score per company, recalculated from published reviews only. Written exclusively by the recalculate_company_scores() trigger.';

create table public.employer_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_status public.subscription_status_enum not null default 'inactive',
  subscription_tier public.subscription_tier_enum,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  constraint employer_accounts_company_id_user_id_key unique (company_id, user_id)
);

comment on table public.employer_accounts is 'Links a company to the user(s) who manage it. Written by service_role only (claim + Stripe webhook flows) — no client-side INSERT/UPDATE policies.';

create table public.company_assessment (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies (id) on delete cascade,
  maternity_pay public.maternity_pay_enum,
  paternity_leave public.paternity_leave_enum,
  shared_parental_leave public.shared_parental_leave_enum,
  flexible_working_from public.flexible_working_from_enum,
  flexible_arrangements text[],
  flexible_workforce_percentage public.flexible_workforce_percentage_enum,
  flexible_seniority_levels public.flexible_seniority_levels_enum,
  flexible_gender_split public.flexible_gender_split_enum,
  formal_carers_policy public.formal_carers_policy_enum,
  emergency_dependant_leave public.emergency_dependant_leave_enum,
  senior_leader_parental_leave public.senior_leader_parental_leave_enum,
  pay_review_inclusion public.pay_review_inclusion_enum,
  return_to_work_programme public.return_to_work_programme_enum,
  proud_of varchar(500),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.company_assessment is 'Employer self-reported family-friendly policy assessment, one row per company.';

-- ============================================================================
-- Indexes
-- ============================================================================

create index companies_industry_idx on public.companies (industry);
create index companies_location_idx on public.companies (location);
create index companies_is_verified_idx on public.companies (is_verified) where is_verified = true;
create index companies_is_claimed_idx on public.companies (is_claimed) where is_claimed = true;

create index reviews_company_id_idx on public.reviews (company_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_published_company_id_idx on public.reviews (company_id) where is_published = true;
create index reviews_is_flagged_idx on public.reviews (is_flagged) where is_flagged = true;

create index company_scores_overall_score_idx on public.company_scores (overall_score);

create index employer_accounts_user_id_idx on public.employer_accounts (user_id);
create index employer_accounts_company_id_idx on public.employer_accounts (company_id);

-- ============================================================================
-- updated_at maintenance
-- ============================================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger company_assessment_set_updated_at
  before update on public.company_assessment
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Privileged-column locks
--
-- Columns that represent moderation state or billing state must only change
-- via the backend (service_role, e.g. an admin action or a Stripe webhook).
-- RLS is row-level, not column-level, so these are enforced with triggers
-- that silently discard client-submitted changes to those specific columns.
-- ============================================================================

create function public.lock_review_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_verified = false;
    new.is_published = false;
    new.is_flagged = false;
  else
    new.is_verified = old.is_verified;
    new.is_published = old.is_published;
    new.is_flagged = old.is_flagged;
  end if;

  return new;
end;
$$;

create trigger reviews_lock_moderation_fields
  before insert or update on public.reviews
  for each row execute function public.lock_review_moderation_fields();

create function public.lock_company_status_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  new.is_verified = old.is_verified;
  new.is_claimed = old.is_claimed;

  return new;
end;
$$;

create trigger companies_lock_status_fields
  before update on public.companies
  for each row execute function public.lock_company_status_fields();

-- ============================================================================
-- company_scores maintenance
--
-- SECURITY DEFINER functions owned by the migration role (postgres) bypass
-- RLS, so this is the only path that ever writes to company_scores — there
-- are no client-facing write policies on that table at all.
-- ============================================================================

create function public.create_company_scores_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_scores (company_id, total_reviews, last_calculated_at)
  values (new.id, 0, now())
  on conflict (company_id) do nothing;
  return new;
end;
$$;

create trigger companies_create_scores_row
  after insert on public.companies
  for each row execute function public.create_company_scores_row();

create function public.recalculate_company_scores(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_reviews integer;
  v_policy_score numeric(3, 2);
  v_reality_score numeric(3, 2);
  v_return_score numeric(3, 2);
  v_overall_score numeric(3, 2);
  v_would_recommend_percentage numeric(5, 2);
begin
  select
    count(*),
    avg(policy_score),
    avg(reality_score),
    avg(return_score),
    avg(overall_score),
    (count(*) filter (where would_recommend in ('absolutely_yes', 'probably_yes'))::numeric
      / nullif(count(*), 0)) * 100
  into
    v_total_reviews,
    v_policy_score,
    v_reality_score,
    v_return_score,
    v_overall_score,
    v_would_recommend_percentage
  from public.reviews
  where company_id = p_company_id
    and is_published = true;

  insert into public.company_scores (
    company_id, policy_score, reality_score, return_score, overall_score,
    total_reviews, would_recommend_percentage, last_calculated_at
  )
  values (
    p_company_id, v_policy_score, v_reality_score, v_return_score, v_overall_score,
    coalesce(v_total_reviews, 0), v_would_recommend_percentage, now()
  )
  on conflict (company_id) do update set
    policy_score = excluded.policy_score,
    reality_score = excluded.reality_score,
    return_score = excluded.return_score,
    overall_score = excluded.overall_score,
    total_reviews = excluded.total_reviews,
    would_recommend_percentage = excluded.would_recommend_percentage,
    last_calculated_at = excluded.last_calculated_at;
end;
$$;

create function public.trigger_recalculate_company_scores()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_company_scores(old.company_id);
    return old;
  end if;

  perform public.recalculate_company_scores(new.company_id);

  if tg_op = 'UPDATE' and old.company_id is distinct from new.company_id then
    perform public.recalculate_company_scores(old.company_id);
  end if;

  return new;
end;
$$;

create trigger reviews_recalculate_company_scores
  after insert or update or delete on public.reviews
  for each row execute function public.trigger_recalculate_company_scores();

-- ============================================================================
-- New auth.users -> profiles
-- ============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.company_scores enable row level security;
alter table public.employer_accounts enable row level security;
alter table public.company_assessment enable row level security;

-- companies: public directory, employer-managed once claimed.
-- No INSERT policy — the company directory is seeded/managed by the backend.

create policy "Companies are viewable by everyone"
  on public.companies for select
  using (true);

create policy "Employers can update their own company"
  on public.companies for update
  to authenticated
  using (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = companies.id and ea.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = companies.id and ea.user_id = auth.uid()
    )
  );

-- profiles: owner-only.

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- reviews: published reviews are public; authors always see their own;
-- authors alone can create a review for themselves.

create policy "Published reviews are viewable by everyone, own reviews always visible"
  on public.reviews for select
  using (is_published = true or auth.uid() = user_id);

create policy "Authors can create their own review"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authors can update their own review"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Authors can delete their own review"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- company_scores: public read-only. No client write policies at all — every
-- write goes through recalculate_company_scores() (SECURITY DEFINER).

create policy "Company scores are viewable by everyone"
  on public.company_scores for select
  using (true);

-- employer_accounts: visible only to the employer it belongs to. No
-- INSERT/UPDATE/DELETE policies — those rows are managed by service_role
-- (claim flow + Stripe webhooks).

create policy "Employers can view their own employer account"
  on public.employer_accounts for select
  to authenticated
  using (auth.uid() = user_id);

-- company_assessment: public once completed, otherwise only the claiming
-- employer; only the claiming employer can write it.

create policy "Completed assessments are viewable by everyone, drafts by the employer"
  on public.company_assessment for select
  using (
    completed_at is not null
    or exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = company_assessment.company_id and ea.user_id = auth.uid()
    )
  );

create policy "Employers can create their own company assessment"
  on public.company_assessment for insert
  to authenticated
  with check (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = company_assessment.company_id and ea.user_id = auth.uid()
    )
  );

create policy "Employers can update their own company assessment"
  on public.company_assessment for update
  to authenticated
  using (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = company_assessment.company_id and ea.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = company_assessment.company_id and ea.user_id = auth.uid()
    )
  );

create policy "Employers can delete their own company assessment"
  on public.company_assessment for delete
  to authenticated
  using (
    exists (
      select 1 from public.employer_accounts ea
      where ea.company_id = company_assessment.company_id and ea.user_id = auth.uid()
    )
  );
