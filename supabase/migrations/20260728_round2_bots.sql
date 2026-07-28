-- 라운드 2: 나의 AI봇 + 봇과 대화 (docs/09 라운드 2)
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- 1) AI봇 — 유저당 1개, 검사 응답으로 자동 생성
create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  quiz_result_id uuid references public.quiz_results(id) on delete set null,
  gender text not null check (gender in ('male', 'female')),
  nickname text not null,
  -- 말투·관심사·연애성향·축 점수 (라운드 2 봇 페르소나 재료)
  profile jsonb not null,
  -- 싱크로율: 검사 완료 시 30에서 시작, 내 봇과 대화할수록 상승
  sync_rate int not null default 30 check (sync_rate between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bots enable row level security;

create policy "bots_select_own"
  on public.bots for select
  using (auth.uid() = user_id);

create index if not exists bots_gender_idx on public.bots (gender);

-- 2) 대화방 — 사람(user) ↔ 봇(partner_bot). 내 봇과의 방 = 싱크로율 훈련방
create table if not exists public.bot_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_bot_id uuid not null references public.bots(id) on delete cascade,
  -- 호감도 v1: 왕복 횟수·메시지 길이 기반 (0~100)
  affinity int not null default 0 check (affinity between 0 and 100),
  message_count int not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, partner_bot_id)
);

alter table public.bot_chats enable row level security;

create policy "bot_chats_select_own"
  on public.bot_chats for select
  using (auth.uid() = user_id);

create index if not exists bot_chats_user_idx on public.bot_chats (user_id);

-- 3) 메시지 — 대화 내용은 본인 방만 조회 가능. 쓰기는 전부 서버(service_role) 경유
create table if not exists public.bot_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.bot_chats(id) on delete cascade,
  role text not null check (role in ('user', 'bot')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.bot_messages enable row level security;

create policy "bot_messages_select_own"
  on public.bot_messages for select
  using (
    exists (
      select 1 from public.bot_chats c
      where c.id = chat_id and c.user_id = auth.uid()
    )
  );

create index if not exists bot_messages_chat_idx on public.bot_messages (chat_id, created_at);

-- 권한: 조회는 RLS 하에 authenticated, 쓰기는 서버 액션(service_role)만
grant select on public.bots, public.bot_chats, public.bot_messages to authenticated;
grant all on public.bots, public.bot_chats, public.bot_messages to service_role;
