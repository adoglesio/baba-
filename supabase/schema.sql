-- ==========================================================
-- Pelada+ — schema do Supabase
-- Cole isso inteiro no SQL Editor do seu projeto (supabase.com)
-- e clique em "Run".
-- ==========================================================

-- Jogadores do elenco
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  posicao text not null default 'Meia',
  nota int not null default 3,
  presente boolean not null default false,
  gols int not null default 0,
  vitorias int not null default 0,
  jogos int not null default 0,
  created_at timestamptz not null default now()
);

-- Grupos salvos (ex: "Baba de quinta")
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  player_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Histórico de partidas
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  time_a text not null,
  time_b text not null,
  placar_a int not null default 0,
  placar_b int not null default 0,
  vencedor text not null default 'Empate',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Row Level Security: cada usuário (cada aparelho, já que
-- usamos login anônimo) só enxerga e edita os PRÓPRIOS dados.
-- ---------------------------------------------------------
alter table public.players enable row level security;
alter table public.groups enable row level security;
alter table public.matches enable row level security;

create policy "players: dono pode tudo" on public.players
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "groups: dono pode tudo" on public.groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "matches: dono pode tudo" on public.matches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- IMPORTANTE: no painel do Supabase, vá em
-- Authentication -> Providers -> Anonymous Sign-Ins
-- e habilite essa opção. É ela que permite o app criar uma
-- "conta" pro celular sem precisar de tela de login/senha.
-- ---------------------------------------------------------
