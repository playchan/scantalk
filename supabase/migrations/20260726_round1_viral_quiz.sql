-- 라운드 1: 바이럴 검사 + 리드 (docs/10-v2-mvp-spec.md 6번)
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- 1) 검사 결과
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  quiz_slug text not null default 'marriage',
  answers jsonb not null,
  axes jsonb not null,
  probability int not null check (probability between 0 and 100),
  result_type text not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

create policy "quiz_results_select_own"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "quiz_results_insert_own"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

create index if not exists quiz_results_user_idx on public.quiz_results (user_id);

-- 2) 사전신청 (1인 1건)
create table if not exists public.preregistrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  quiz_result_id uuid not null references public.quiz_results(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.preregistrations enable row level security;

create policy "preregistrations_select_own"
  on public.preregistrations for select
  using (auth.uid() = user_id);

create policy "preregistrations_insert_own"
  on public.preregistrations for insert
  with check (auth.uid() = user_id);

-- 3) 이벤트 (측정 기준 데이터)
-- RLS 정책을 만들지 않음 = service_role(서버)만 읽고 쓸 수 있음.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid,
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ref text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create index if not exists events_name_created_idx on public.events (name, created_at);
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_created_idx on public.events (created_at);
