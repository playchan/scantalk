-- 매칭 v1 (docs/09 라운드 3 정정판): 사람↔봇 호감도 75% 도달 → 봇 주인과 매칭
-- 한쪽만 수락하면 상대에게 알리지 않는다 (거절당하는 경험 없음).

create table if not exists public.bot_matches (
  id uuid primary key default gen_random_uuid(),
  -- 호감도가 임계치에 도달한 대화방 (사람 requester ↔ owner의 봇)
  chat_id uuid not null unique references public.bot_chats(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  requester_accepted boolean not null default true,
  owner_accepted boolean not null default false,
  status text not null default 'proposed' check (status in ('proposed', 'matched', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.bot_matches enable row level security;

create policy bot_matches_select_participant
  on public.bot_matches for select
  using (auth.uid() = requester_id or auth.uid() = owner_id);

create index if not exists bot_matches_owner_idx on public.bot_matches (owner_id);
create index if not exists bot_matches_requester_idx on public.bot_matches (requester_id);

-- 매칭 성사 후 사람↔사람 대화 (양쪽 공용 방)
create table if not exists public.match_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.bot_matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.match_messages enable row level security;

create policy match_messages_select_participant
  on public.match_messages for select
  using (
    exists (
      select 1 from public.bot_matches m
      where m.id = match_id
        and (m.requester_id = auth.uid() or m.owner_id = auth.uid())
    )
  );

create index if not exists match_messages_match_idx on public.match_messages (match_id, created_at);

grant select on public.bot_matches, public.match_messages to authenticated;
grant all on public.bot_matches, public.match_messages to service_role;
