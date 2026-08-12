import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { gerarTimes, uid } from '../utils/teamBalancer';

const AppContext = createContext(null);
const DRAW_KEY = 'peladaPlus:draw';
const MATCH_KEY = 'peladaPlus:match';

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);

  const [draw, setDraw] = useState(null);
  const [match, setMatch] = useState(null);
  const hidratado = useRef(false);

  // restaura o sorteio/partida em andamento (sobrevive a fechar/recarregar a página)
  useEffect(() => {
    (async () => {
      try {
        const [savedDraw, savedMatch] = await Promise.all([
          AsyncStorage.getItem(DRAW_KEY),
          AsyncStorage.getItem(MATCH_KEY),
        ]);
        if (savedDraw) setDraw(JSON.parse(savedDraw));
        if (savedMatch) setMatch(JSON.parse(savedMatch));
      } catch (e) {
        console.warn('Erro ao restaurar sorteio/partida salvos:', e.message);
      } finally {
        hidratado.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!hidratado.current) return;
    if (draw) AsyncStorage.setItem(DRAW_KEY, JSON.stringify(draw));
    else AsyncStorage.removeItem(DRAW_KEY);
  }, [draw]);

  useEffect(() => {
    if (!hidratado.current) return;
    if (match) AsyncStorage.setItem(MATCH_KEY, JSON.stringify(match));
    else AsyncStorage.removeItem(MATCH_KEY);
  }, [match]);

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
    refreshAll();
  }, [refreshAll]);

  async function addPlayer({ nome, posicao, nota, gols, assistencias }) {
    const { data, error } = await supabase
      .from('players')
      .insert({ nome, posicao, nota, gols: gols || 0, assistencias: assistencias || 0 })
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
    if (ids.length === 0) return;
    const { error } = await supabase.from('players').update({ presente: valor }).in('id', ids);
    if (error) throw error;
    setPlayers((prev) => prev.map((p) => ({ ...p, presente: valor })));
  }

  async function saveGroup(nome) {
    const presentesIds = players.filter((p) => p.presente).map((p) => p.id);
    const { data, error } = await supabase
      .from('groups')
      .insert({ nome, player_ids: presentesIds })
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
    if (idsAll.length > 0) await supabase.from('players').update({ presente: false }).in('id', idsAll);
    if (idsPresentes.size > 0) await supabase.from('players').update({ presente: true }).in('id', [...idsPresentes]);
    setPlayers((prev) => prev.map((p) => ({ ...p, presente: idsPresentes.has(p.id) })));
  }

  async function deleteGroup(id) {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw error;
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function sortear(numTimesEscolhido) {
    const presentes = players.filter((p) => p.presente);
    if (presentes.length < 2) return;
    const numTimes = Math.max(2, Math.min(numTimesEscolhido, Math.floor(presentes.length / 2)));
    setDraw({ teams: gerarTimes(presentes, numTimes) });
    setMatch(null);
  }

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
      golLog: [],
    });
  }

  function marcarGol(time, scorerId, assistId) {
    setMatch((m) => {
      if (!m) return m;
      const novo = { ...m, golLog: [...m.golLog, { time, scorerId, assistId: assistId || null }] };
      if (time === 'A') novo.scoreA = m.scoreA + 1;
      else novo.scoreB = m.scoreB + 1;
      return novo;
    });
  }

  function desfazerGol(time) {
    setMatch((m) => {
      if (!m) return m;
      const idx = [...m.golLog].reverse().findIndex((g) => g.time === time);
      if (idx === -1) return m;
      const realIdx = m.golLog.length - 1 - idx;
      const novoLog = [...m.golLog.slice(0, realIdx), ...m.golLog.slice(realIdx + 1)];
      const novo = { ...m, golLog: novoLog };
      if (time === 'A') novo.scoreA = Math.max(0, m.scoreA - 1);
      else novo.scoreB = Math.max(0, m.scoreB - 1);
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

    const golsPorJogador = {};
    const assistPorJogador = {};
    m.golLog.forEach((g) => {
      if (g.scorerId) golsPorJogador[g.scorerId] = (golsPorJogador[g.scorerId] || 0) + 1;
      if (g.assistId) assistPorJogador[g.assistId] = (assistPorJogador[g.assistId] || 0) + 1;
    });

    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    const idsEnvolvidos = [...teamA.players, ...teamB.players];
    const updates = idsEnvolvidos.map((pid) => {
      const p = byId[pid];
      const venceu = vencedor && (vencedor.id === teamA.id ? teamA : teamB).players.includes(pid);
      return {
        id: pid,
        jogos: (p.jogos || 0) + 1,
        vitorias: (p.vitorias || 0) + (venceu ? 1 : 0),
        gols: (p.gols || 0) + (golsPorJogador[pid] || 0),
        assistencias: (p.assistencias || 0) + (assistPorJogador[pid] || 0),
      };
    });
    await Promise.all(updates.map((u) => supabase.from('players').update(u).eq('id', u.id)));
    setPlayers((prev) =>
      prev.map((p) => {
        const u = updates.find((x) => x.id === p.id);
        return u ? { ...p, ...u } : p;
      })
    );

    const { data: histRow } = await supabase
      .from('matches')
      .insert({
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
      setMatch({ ...m, onFieldA: vencedor, onFieldB: proximo, scoreA: 0, scoreB: 0, seconds: m.duration * 60, running: false, queue: novaFila, golLog: [] });
    } else {
      setMatch({ ...m, scoreA: 0, scoreB: 0, seconds: m.duration * 60, running: false, golLog: [] });
    }
  }

  function teamName(t) {
    return t ? t.nome.replace('Colete ', '') : '–';
  }

  const value = {
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
    desfazerGol,
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
