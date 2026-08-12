-- ==========================================================
-- Pelada+ — schema do Supabase (v2: dados compartilhados)
-- Cole isso inteiro no SQL Editor do seu projeto (supabase.com)
-- e clique em "Run".
--
-- Se você já tinha rodado a v1 (com user_id), rode primeiro:
--   drop table if exists public.matches;
--   drop table if exists public.groups;
--   drop table if exists public.players;
-- e depois cole este arquivo inteiro.
-- ==========================================================

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  posicao text not null default 'Meia',
  nota int not null default 3,
  presente boolean not null default false,
  gols int not null default 0,
  assistencias int not null default 0,
  vitorias int not null default 0,
  jogos int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  player_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  time_a text not null,
  time_b text not null,
  placar_a int not null default 0,
  placar_b int not null default 0,
  vencedor text not null default 'Empate',
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.groups enable row level security;
alter table public.matches enable row level security;

drop policy if exists "players: acesso liberado" on public.players;
create policy "players: acesso liberado" on public.players
  for all using (true) with check (true);

drop policy if exists "groups: acesso liberado" on public.groups;
create policy "groups: acesso liberado" on public.groups
  for all using (true) with check (true);

drop policy if exists "matches: acesso liberado" on public.matches;
create policy "matches: acesso liberado" on public.matches
  for all using (true) with check (true);
