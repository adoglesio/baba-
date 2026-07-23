import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, ensureSession } from '../lib/supabase';
import { gerarTimes, uid } from '../utils/teamBalancer';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);

  // sorteio/partida em andamento não precisam ir pro banco — vivem só na memória do app
  const [draw, setDraw] = useState(null);
  const [match, setMatch] = useState(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [{ data: playersData, error: e1 }, { data: groupsData, error: e2 }, { data: historyData, error: e3 }] =
      await Promise.all([
        supabase.from('players').select('*').order('nome'),
        supabase.from('groups').select('*').order('created_at', { ascending: false }),
        supabase.from('matches').select('*').order('created_at', { ascending: false }).limit(30),
      ]);
    if (e1) console.warn('Erro ao carregar jogadores:', e1.message);
    if (e2) console.warn('Erro ao carregar grupos:', e2.message);
    if (e3) console.warn('Erro ao carregar histórico:', e3.message);
    setPlayers(playersData || []);
    setGroups(groupsData || []);
    setHistory(historyData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        setReady(true);
        await refreshAll();
      } catch (e) {
        console.warn('Erro ao iniciar sessão Supabase:', e.message);
        setLoading(false);
      }
    })();
  }, [refreshAll]);

  // ---------- JOGADORES ----------
  async function addPlayer({ nome, posicao, nota }) {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('players')
      .insert({ nome, posicao, nota, user_id: userData.user.id })
      .select()
      .single();
    if (error) throw error;
    setPlayers((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
  }

  async function updatePlayer(id, patch) {
    const { data, error } = await supabase.from('players').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => (p.id === id ? data : p)));
  }

  async function deletePlayer(id) {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw error;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePresente(id) {
    const p = players.find((x) => x.id === id);
    await updatePlayer(id, { presente: !p.presente });
  }

  async function marcarTodosPresentes(valor) {
    const ids = players.map((p) => p.id);
    const { error } = await supabase.from('players').update({ presente: valor }).in('id', ids);
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => ({ ...p, presente: valor })));
  }

  // ---------- GRUPOS ----------
  async function saveGroup(nome) {
    const presentesIds = players.filter((p) => p.presente).map((p) => p.id);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('groups')
      .insert({ nome, player_ids: presentesIds, user_id: userData.user.id })
      .select()
      .single();
    if (error) throw error;
    setGroups((prev) => [data, ...prev]);
  }

  async function loadGroup(id) {
    const g = groups.find((x) => x.id === id);
    if (!g) return;
    const idsPresentes = new Set(g.player_ids);
    const idsAll = players.map((p) => p.id);
    await supabase.from('players').update({ presente: false }).in('id', idsAll);
    await supabase.from('players').update({ presente: true }).in('id', [...idsPresentes]);
    setPlayers((prev) => prev.map((p) => ({ ...p, presente: idsPresentes.has(p.id) })));
  }

  async function deleteGroup(id) {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw error;
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  // ---------- SORTEIO ----------
  function sortear(numTimesEscolhido) {
    const presentes = players.filter((p) => p.presente);
    if (presentes.length < 2) return;
    const numTimes = Math.max(2, Math.min(numTimesEscolhido, Math.floor(presentes.length / 2)));
    setDraw({ teams: gerarTimes(presentes, numTimes) });
    setMatch(null);
  }

  // ---------- PARTIDA ----------
  function iniciarPartida({ duration, goalTarget }) {
    if (!draw) return;
    const teams = draw.teams;
    setMatch({
      onFieldA: teams[0],
      onFieldB: teams[1],
      queue: teams.slice(2).map((t) => t.id),
      scoreA: 0,
      scoreB: 0,
      duration,
      goalTarget,
      seconds: duration * 60,
      running: false,
    });
  }

  function marcarGol(time, delta) {
    setMatch((m) => {
      if (!m) return m;
      const novo = { ...m };
      if (time === 'A') novo.scoreA = Math.max(0, m.scoreA + delta);
      else novo.scoreB = Math.max(0, m.scoreB + delta);
      return novo;
    });
  }

  function tick() {
    setMatch((m) => {
      if (!m || !m.running) return m;
      const seconds = m.seconds - 1;
      if (seconds <= 0) return { ...m, seconds: 0, running: false };
      return { ...m, seconds };
    });
  }

  function toggleTimer() {
    setMatch((m) => (m ? { ...m, running: !m.running } : m));
  }

  async function encerrarRodada() {
    if (!match) return;
    const m = match;
    const teamA = m.onFieldA;
    const teamB = m.onFieldB;
    let vencedor = null;
    let perdedor = null;
    if (m.scoreA > m.scoreB) {
      vencedor = teamA;
      perdedor = teamB;
    } else if (m.scoreB > m.scoreA) {
      vencedor = teamB;
      perdedor = teamA;
    }

    // atualiza estatísticas dos jogadores (vitórias/jogos) no Supabase
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    const golsPorJogador = {};
    distribuiGolsSimulados(teamA, m.scoreA, golsPorJogador);
    distribuiGolsSimulados(teamB, m.scoreB, golsPorJogador);

    const updates = [...teamA.players, ...teamB.players].map((pid) => {
      const p = byId[pid];
      const venceu = vencedor && (vencedor.id === teamA.id ? teamA : teamB).players.includes(pid);
      return {
        id: pid,
        jogos: (p.jogos || 0) + 1,
        vitorias: (p.vitorias || 0) + (venceu ? 1 : 0),
        gols: (p.gols || 0) + (golsPorJogador[pid] || 0),
      };
    });
    await Promise.all(updates.map((u) => supabase.from('players').update(u).eq('id', u.id)));
    setPlayers((prev) =>
      prev.map((p) => {
        const u = updates.find((x) => x.id === p.id);
        return u ? { ...p, ...u } : p;
      })
    );

    // salva no histórico
    const { data: userData } = await supabase.auth.getUser();
    const { data: histRow } = await supabase
      .from('matches')
      .insert({
        user_id: userData.user.id,
        time_a: teamName(teamA),
        time_b: teamName(teamB),
        placar_a: m.scoreA,
        placar_b: m.scoreB,
        vencedor: vencedor ? teamName(vencedor) : 'Empate',
      })
      .select()
      .single();
    if (histRow) setHistory((prev) => [histRow, ...prev]);

    if (vencedor && m.queue.length > 0) {
      const proximoId = m.queue[0];
      const proximo = draw.teams.find((t) => t.id === proximoId);
      const novaFila = [...m.queue.slice(1), perdedor.id];
      setMatch({ ...m, onFieldA: vencedor, onFieldB: proximo, scoreA: 0, scoreB: 0, seconds: m.duration * 60, running: false, queue: novaFila });
    } else {
      setMatch({ ...m, scoreA: 0, scoreB: 0, seconds: m.duration * 60, running: false });
    }
  }

  function distribuiGolsSimulados(team, gols, acc) {
    if (gols <= 0 || team.players.length === 0) return;
    for (let i = 0; i < gols; i++) {
      const pid = team.players[i % team.players.length];
      acc[pid] = (acc[pid] || 0) + 1;
    }
  }

  function teamName(t) {
    return t ? t.nome.replace('Colete ', '') : '–';
  }

  const value = {
    ready,
    loading,
    players,
    groups,
    history,
    draw,
    match,
    refreshAll,
    addPlayer,
    updatePlayer,
    deletePlayer,
    togglePresente,
    marcarTodosPresentes,
    saveGroup,
    loadGroup,
    deleteGroup,
    sortear,
    iniciarPartida,
    marcarGol,
    tick,
    toggleTimer,
    encerrarRodada,
    teamName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>');
  return ctx;
}
